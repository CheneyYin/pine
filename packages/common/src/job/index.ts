import { RunnerSpec, RunnerSpecSchema } from '../runner';
import { z } from 'zod';

const JobSchema = z.object({
    id: z.string().readonly(),
    name: z.string().readonly(),
    description: z.string().readonly().optional(),
    use: z.string().readonly(),
    with: RunnerSpecSchema.readonly(),
});

export type Job = Readonly<
    Omit<z.infer<typeof JobSchema>, 'with'> & {
        with: RunnerSpec;
    }
>;

export type JobState =
    | 'STAGED'
    | 'SUBMITTED'
    | 'STARTED'
    | 'STOPPED'
    | 'TERMINATED';

export type TerminatedDescription = {
    readonly timestamp: number;
    readonly error: Error;
};

export type JobInfo = {
    readonly job: Job;
    readonly submitTime: number;
    readonly startTime: number;
    readonly stopTime: number;
    readonly attempt: number;
    readonly status: JobState;
    readonly terminatedDescription?: TerminatedDescription;
};
