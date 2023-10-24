import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import { userInfo } from 'node:os';
import { z } from 'zod';

const PINE_WORKER_ROOT_DIR = process.env['PINE_WORKER_ROOT_DIR'];

type WorkspaceOptions = {
    rootDir: string;
};

export type WorkspaceParam = Partial<WorkspaceOptions>;

type WorkspaceNS = {
    readonly manifestPath: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const workspaceFactory = (opts: WorkspaceParam) => {
    const applyOpts: WorkspaceOptions = {
        ...opts,
        rootDir:
            opts.rootDir ??
            PINE_WORKER_ROOT_DIR ??
            `${userInfo().homedir}/pine/worker`,
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
}

export const Workspacer = {};
