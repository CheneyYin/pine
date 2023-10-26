import { existsSync, statSync } from 'node:fs';
import fs from 'node:fs/promises';
import { userInfo } from 'node:os';
import { z } from 'zod';

export enum PINE_ENV {
    WORKER_ROOT_DIR = 'PINE_WORKER_ROOT_DIR',
}

type WorkspaceOptions = {
    rootDir: string;
};

export type WorkspaceParam = Partial<WorkspaceOptions>;

type WorkspaceNS = {
    readonly manifestPath: string;
};

export const defaultWorkerDir = () => `${userInfo().homedir}/pine/worker`;

export const workspaceFactory = (opts: WorkspaceParam) => {
    const _WORKER_ROOT_DIR = process.env[PINE_ENV.WORKER_ROOT_DIR];
    const applyOpts: WorkspaceOptions = {
        ...opts,
        rootDir: opts.rootDir ?? _WORKER_ROOT_DIR ?? defaultWorkerDir(),
    };
    return new Workspace(applyOpts);
};

export const ManifestSchema = z.object({
    createTime: z.coerce.date().readonly(),
    createBy: z.string().readonly(),
});

export type Manifest = Readonly<z.infer<typeof ManifestSchema>>;

const createManifest = (): Manifest => ({
    createTime: new Date(),
    createBy: userInfo().username,
});

const readManifest = async (path: string): Promise<Manifest> => {
    try {
        const payload = await fs.readFile(path, {
            encoding: 'utf-8',
        });
        const obj = JSON.parse(payload) as Manifest;
        const manifest: Manifest = ManifestSchema.parse(obj);
        return manifest;
    } catch (error) {
        console.error(`Fail to read manifest at ${path}.`);
        throw error;
    }
};

const writeManifest = async (path: string, manifest?: Manifest) => {
    const payload = JSON.stringify(manifest ?? createManifest());

    try {
        await fs.writeFile(path, payload);
    } catch (error) {
        console.error(`Fail to write manifest at ${path}.`);
        throw error;
    }
};

export const manifestUtil = {
    create: createManifest,
    read: readManifest,
    write: writeManifest,
};

class Workspace {
    ns: WorkspaceNS;
    constructor(private opts: WorkspaceOptions) {
        this.ns = {
            manifestPath: `${opts.rootDir}/manifest.json`,
        };
    }

    async create() {
        const rootDir = this.opts.rootDir;
        if (!existsSync(rootDir)) {
            try {
                await fs.mkdir(rootDir, {
                    recursive: true,
                });
                await writeManifest(this.ns.manifestPath);
            } catch (error) {
                console.error(`Fail to create workspace at ${rootDir}.`);
                console.error(error);
                process.exit(1);
            }
        }
    }

    async clean() {
        const rootDir = this.opts.rootDir;
        if (!existsSync(rootDir)) {
            throw new Error(`At ${rootDir}, workspace isn't existed.`);
        }
        if (!statSync(rootDir).isDirectory()) {
            throw new Error(`Workspace path[${rootDir}] isn't a directory.`);
        }

        await fs.rm(rootDir, {
            recursive: true,
            force: true,
        });
    }
}

export const Workspacer = {};
