import { existsSync, statSync } from 'fs';
import { rm } from 'fs/promises';
import { RunnerSpaceParam, createRunnerSpace } from './RunnerSpace';

const cleanDir = async (path: string) => {
    console.info(`cleaning ${path}.`);
    if (!existsSync(path)) {
        return;
    }

    if (!statSync(path).isDirectory()) {
        throw new Error(`${path} isn't directory.`);
    }

    await rm(path, {
        force: true,
        recursive: true,
    });
};

describe('test runner space', () => {
    const path = '/tmp/pine/runner';

    beforeEach(async () => {
        try {
            await cleanDir(path);
        } catch (error) {
            console.error(`Fail to clean directory[${path}]`);
            expect(error).toBeFalsy();
        }
    });

    afterEach(async () => {
        try {
            await cleanDir(path);
        } catch (error) {
            console.error(`Fail to clean directory[${path}]`);
        }
    });

    test(`test runner create space at ${path}`, async () => {
        const opts: RunnerSpaceParam = {
            rootDir: path,
        };
        const runnerSpace = createRunnerSpace(opts);

        expect(existsSync(path)).toBeFalsy();

        await runnerSpace.create();
        expect(existsSync(path)).toBeTruthy();
        expect(statSync(path).isDirectory()).toBeTruthy();

        await runnerSpace.clean();
        expect(existsSync(path)).toBeFalsy();

        await expect(runnerSpace.clean()).rejects.toThrowError();
    });
});
