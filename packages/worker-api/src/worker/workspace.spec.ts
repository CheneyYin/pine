import {
    Manifest,
    WorkspaceParam,
    manifestValidator,
    workspaceFactory,
} from './workspace';
import { userInfo } from 'node:os';
import { existsSync, statSync } from 'node:fs';
import fs from 'node:fs/promises';

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

describe('create workspace', () => {
    const opts: WorkspaceParam = {
        rootDir: `${userInfo().homedir}/pine`,
    };

    beforeAll(async () => {
        if (opts.rootDir) {
            console.info(`cleaning ${opts.rootDir}`);
            await cleanDir(opts.rootDir);
        }
    });

    test('create', async () => {
        const workspace = workspaceFactory(opts);
        try {
            await workspace.create();
            expect(await validateWorkspace(opts.rootDir!)).toBeTruthy();
        } catch (error) {
            console.error(error);
            expect(false).toBeTruthy();
        }
    });

    afterAll(async () => {
        if (opts.rootDir) {
            await cleanDir(opts.rootDir);
        }
    });
});
