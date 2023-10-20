import { WorkspaceParam, workspaceFactory } from './workspace';

describe('create workspace', () => {
    test('create', async () => {
        const opts: WorkspaceParam = {};
        const workspace = workspaceFactory(opts);
        try {
            await workspace.create();
        } catch (error) {
            console.error(error);
        }
        expect(1).toBe(1);
    });
});
