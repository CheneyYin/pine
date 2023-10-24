import type { WorkspaceParam, Manifest } from './workspace';
import {
    PINE_ENV,
    defaultWorkerDir,
    manifestValidator,
    workspaceFactory,
} from './workspace';
import { userInfo } from 'node:os';
import { existsSync, statSync } from 'node:fs';
import fs from 'node:fs/promises';
import * as process from 'node:process';
import { after, before } from 'node:test';

const cleanDir = async (path: string) => {
    if (existsSync(path) && statSync(path).isDirectory()) {
        await fs.rm(path, {
            recursive: true,
            force: true,
        });
    }
};

const validateWorkspace = async (path: string) => {
    if (!existsSync(path)) {
        throw new Error(`${path} isn't existed.`);
    }

    if (!statSync(path).isDirectory()) {
        throw new Error(`${path} isn't directory.`);
    }

    const manifestPath = `${path}/manifest.json`;
    if (!existsSync(manifestPath)) {
        throw new Error(`${manifestPath} isn't existed.`);
    }

    if (!statSync(manifestPath).isFile()) {
        throw new Error(`${manifestPath} isn't file.`);
    }

    const payload = await fs.readFile(manifestPath);
    const manifestObj: Manifest = JSON.parse(
        payload.toString('utf-8'),
    ) as Manifest;
    if (!manifestValidator.safeParse(manifestObj).success) {
        throw new Error(`${JSON.stringify(manifestObj)} isn't validated.`);
    }

    return true;
};

describe('test Manifest validator', () => {
    test('validate', () => {
        const manifest: Manifest = {
            createBy: 'tom',
            createTime: new Date().toLocaleDateString(),
        };

        expect(manifestValidator.safeParse(manifest).success).toBeTruthy();
    });

    test('not validated', () => {
        expect(
            manifestValidator.safeParse({
                createBy: 'tome',
            }).success,
        ).toBeFalsy();
    });
});

describe(`create from default worker directory`, () => {
    const workerDir = defaultWorkerDir();

    before(async () => {
        console.info(`cleaning ${workerDir}`);
        await cleanDir(workerDir);
    });

    after(async () => {
        console.info(`cleaning ${workerDir}`);
        await cleanDir(workerDir);
    });

    it(`create workspace at ${workerDir}`, async () => {
        const workspace = workspaceFactory({});
        try {
            await workspace.create();
            expect(await validateWorkspace(workerDir)).toBeTruthy();
        } catch (error) {
            console.error(error);
            expect(false).toBeTruthy();
        }
    });
});

describe('create from WorkspaceParam', () => {
    const opts: WorkspaceParam = {
        rootDir: `${userInfo().homedir}/_opts_pine`,
    };

    before(async () => {
        if (opts.rootDir) {
            console.info(`cleaning ${opts.rootDir}`);
            await cleanDir(opts.rootDir);
        }
    });

    after(async () => {
        if (opts.rootDir) {
            await cleanDir(opts.rootDir);
        }
    });

    it(`create at ${opts.rootDir}`, async () => {
        const workspace = workspaceFactory(opts);
        try {
            await workspace.create();
            expect(await validateWorkspace(opts.rootDir!)).toBeTruthy();
        } catch (error) {
            console.error(error);
            expect(false).toBeTruthy();
        }
    });
});

describe(`create from Environment[${PINE_ENV.WORKER_ROOT_DIR}]`, () => {
    const _WORKER_ROOT_DIR = `${userInfo().homedir}/_env_pine`;
    process.env[PINE_ENV.WORKER_ROOT_DIR] = _WORKER_ROOT_DIR;

    before(async () => {
        console.info(`cleaning ${_WORKER_ROOT_DIR}`);
        await cleanDir(_WORKER_ROOT_DIR);
    });

    after(async () => {
        console.info(`cleaning ${_WORKER_ROOT_DIR}`);
        await cleanDir(_WORKER_ROOT_DIR);
    });

    it(`create workspace at ${_WORKER_ROOT_DIR}`, async () => {
        const workspace = workspaceFactory({});
        try {
            await workspace.create();
            expect(await validateWorkspace(_WORKER_ROOT_DIR)).toBeTruthy();
        } catch (error) {
            console.error(error);
            expect(false).toBeTruthy();
        }
    });
});
