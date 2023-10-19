import path from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import { RollupOptions } from 'rollup';
import del from 'rollup-plugin-delete';
import multiInput from 'rollup-plugin-multi-input';
import externals from 'rollup-plugin-node-externals';
import typescript from 'rollup-plugin-typescript2';

const extensions = ['.ts', '.tsx'];

type Options = {
    input: string[];
    packageDir: string;
};

function types({ input, packageDir }: Options): RollupOptions {
    return {
        input,
        output: {
            dir: `${packageDir}/dist`,
        },
        plugins: [
            del({
                targets: `${packageDir}/dist`,
            }),
            multiInput({ relative: path.resolve(packageDir, 'src/') }),
            externals({
                packagePath: path.resolve(packageDir, 'package.json'),
                deps: true,
                devDeps: true,
                peerDeps: true,
            }),
            typescript({
                tsconfig: path.resolve(packageDir, 'tsconfig.json'),
                tsconfigOverride: { emitDeclarationOnly: true },
                abortOnError: true,
            }),
        ],
    };
}

export function buildConfig({ input, packageDir }: Options): RollupOptions[] {
    const resolvedInput = input.map((file) => path.resolve(packageDir, file));
    const options: Options = {
        input: resolvedInput,
        packageDir,
    };

    return [types(options)];
}
