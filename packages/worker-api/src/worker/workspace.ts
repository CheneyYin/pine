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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const workspaceFactory = (opts: WorkspaceParam) => {
    const _WORKER_ROOT_DIR = process.env[PINE_ENV.WORKER_ROOT_DIR];
    const applyOpts: WorkspaceOptions = {
        ...opts,
        rootDir: opts.rootDir ?? _WORKER_ROOT_DIR ?? defaultWorkerDir(),
    };
    return new Workspace(applyOpts);
};

export const manifestValidator = z.object({
    createTime: z.string(),
    createBy: z.string(),
});

export type Manifest = z.infer<typeof manifestValidator>;

const createManifest: () => Manifest = () => ({
    createTime: Date.now().toString(),
    createBy: userInfo().username,
});

async function writeManifest(path: string) {
    const manifest = createManifest();
    const payload = JSON.stringify(manifest);
    try {
        await fs.writeFile(path, payload);
    } catch (error) {
        console.error(`Fail to write manifest at ${path}.`);
        console.error(error);
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
