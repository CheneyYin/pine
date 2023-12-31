import type { WorkspaceParam, Manifest } from './Workspace';
import { PINE_ENV } from '@pine/common';
import {
    defaultWorkerDir,
    ManifestSchema,
    workspaceFactory,
    manifestUtil,
} from './Workspace';
import { userInfo } from 'node:os';
import { existsSync, statSync } from 'node:fs';
import fs from 'node:fs/promises';
import * as process from 'node:process';

const deleteFile = async (path: string) => {
    if (existsSync(path) && statSync(path).isFile()) {
        await fs.rm(path, {
            force: true,
        });
    }
};

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
    const manifestObj: Manifest = ManifestSchema.parse(
        JSON.parse(payload.toString('utf-8')),
    );
    if (!ManifestSchema.safeParse(manifestObj).success) {
        throw new Error(`${JSON.stringify(manifestObj)} isn't validated.`);
    }

    return true;
};

describe('test Manifest validator', () => {
    test('validate', () => {
        const manifest: Manifest = {
            createBy: 'tom',
            createTime: new Date(),
        };

        expect(ManifestSchema.safeParse(manifest).success).toBeTruthy();
    });

    test('not validated', () => {
        expect(
            ManifestSchema.safeParse({
                createBy: 'tome',
            }).success,
        ).toBeFalsy();
    });
});

describe('test write and read manifest', () => {
    const path = '/tmp/test_manifest.json';

    beforeAll(async () => {
        if (existsSync(path) && statSync(path).isFile()) {
            await deleteFile(path);
        }
    });

    afterAll(async () => {
        if (existsSync(path) && statSync(path).isFile()) {
            await deleteFile(path);
        }
    });

    test(`test write manifest at ${path}.`, async () => {
        try {
            const manifest = ManifestSchema.parse(manifestUtil.create());
            await manifestUtil.write(path, manifest);
            expect(true).toBeTruthy();
        } catch (error) {
            expect(error).toBeFalsy();
        }
    });

    test(`test read manifest at ${path}`, async () => {
        try {
            const manifest: Manifest = await manifestUtil.read(path);
            expect(ManifestSchema.safeParse(manifest).success).toBeTruthy();
        } catch (error) {
            expect(error).toBeFalsy();
        }
    });
});

describe(`create from default worker directory`, () => {
    const workerDir = defaultWorkerDir();

    beforeEach(async () => {
        console.info(`cleaning ${workerDir}`);
        await cleanDir(workerDir);
    });

    afterEach(async () => {
        console.info(`cleaning ${workerDir}`);
        await cleanDir(workerDir);
    });

    test(`create workspace at ${workerDir}`, async () => {
        const workspace = workspaceFactory({});
        try {
            await workspace.create();
            expect(await validateWorkspace(workerDir)).toBeTruthy();
        } catch (error) {
            expect(error).toBeFalsy();
        }
    });
});

describe('create from WorkspaceParam', () => {
    const opts: WorkspaceParam = {
        rootDir: `${userInfo().homedir}/_opts_pine`,
    };

    beforeEach(async () => {
        if (opts.rootDir) {
            console.info(`cleaning ${opts.rootDir}`);
            await cleanDir(opts.rootDir);
        }
    });

    afterEach(async () => {
        if (opts.rootDir) {
            await cleanDir(opts.rootDir);
        }
    });

    test(`create at ${opts.rootDir}`, async () => {
        const workspace = workspaceFactory(opts);
        try {
            await workspace.create();
            expect(await validateWorkspace(opts.rootDir!)).toBeTruthy();
        } catch (error) {
            expect(error).toBeFalsy();
        }
    });
});

describe(`create from Environment[${PINE_ENV.WORKER_ROOT_DIR}]`, () => {
    const _WORKER_ROOT_DIR = `${userInfo().homedir}/_env_pine`;

    beforeEach(async () => {
        console.info(`cleaning ${_WORKER_ROOT_DIR}`);
        process.env[PINE_ENV.WORKER_ROOT_DIR] = _WORKER_ROOT_DIR;
        await cleanDir(_WORKER_ROOT_DIR);
    });

    afterEach(async () => {
        console.info(`cleaning ${_WORKER_ROOT_DIR}`);
        await cleanDir(_WORKER_ROOT_DIR);
        process.env[PINE_ENV.WORKER_ROOT_DIR] = undefined;
    });

    test(`create workspace at ${_WORKER_ROOT_DIR}`, async () => {
        const workspace = workspaceFactory({});
        try {
            await workspace.create();
            expect(await validateWorkspace(_WORKER_ROOT_DIR)).toBeTruthy();
        } catch (error) {
            expect(error).toBeFalsy();
        }
    });
});

describe('clean workspace', () => {
    const workerDir = defaultWorkerDir();
    const workspace = workspaceFactory({});

    beforeEach(async () => {
        console.info(`create workspace at ${workerDir}`);
        await workspace.create();
        if (!existsSync(workerDir)) {
            expect(`Fail to create workspace at ${workerDir}`).toBeFalsy();
        }
    });

    afterEach(async () => {
        console.info(`cleaning ${workerDir}`);
        await cleanDir(workerDir);
    });

    test(`clean workspace at ${workerDir}`, async () => {
        try {
            await workspace.clean();
            const isCleaned = !existsSync(workerDir);
            expect(isCleaned).toBeTruthy();
        } catch (error) {
            expect(error).toBeFalsy();
        }
    });
});
