import { existsSync, statSync } from 'fs';
import { mkdir, rm } from 'fs/promises';

export type RunnerSpace = {
    create: (() => Promise<void>) | (() => void);
    clean: (() => Promise<void>) | (() => void);
};

type RunnerSpaceOptions = {
    rootDir: string;
};

export type RunnerSpaceParam = RunnerSpaceOptions;

const createRoot = async (rootDir: string) => {
    const isExisted = existsSync(rootDir);

    if (isExisted && !statSync(rootDir).isDirectory()) {
        throw new Error(
            `Runner root at ${rootDir} is existed and isn't directory.`,
        );
    }

    if (!isExisted) {
        try {
            await mkdir(rootDir);
        } catch (error) {
            console.error(`Fail to create runner space at ${rootDir}`);
            throw error;
        }
    }
};

const cleanRoot = async (rootDir: string) => {
    const isExisted = existsSync(rootDir);

    if (!isExisted) {
        throw new Error(`Runner root at ${rootDir} isn't existed.`);
    }

    if (!statSync(rootDir).isDirectory()) {
        throw new Error(`${rootDir} isn't directory.`);
    }
    try {
        await rm(rootDir, {
            force: true,
            recursive: true,
        });
    } catch (error) {
        console.error(`Fail to clean Runner space at ${rootDir}.`);
        throw error;
    }
};

export const createRunnerSpace = (opts: RunnerSpaceParam): RunnerSpace => {
    return {
        create: async () => {
            await createRoot(opts.rootDir);
        },
        clean: async () => {
            await cleanRoot(opts.rootDir);
        },
    };
};
