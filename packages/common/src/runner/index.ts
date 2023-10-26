import { z } from 'zod';

export const RunnerSpecSchema = z.object({
    x: z.string(),
});

export type RunnerSpec = z.infer<typeof RunnerSpecSchema>;

export type IRunner = {
    token: string;
    spec: RunnerSpec;
    setup: () => void;
    start: () => void;
    stop: () => void;
    restart: () => void;
    forceStop: () => void;
};
