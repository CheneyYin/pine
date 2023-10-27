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

//  Job State Transfer
//
//   +-------------------------------+
//   v                               |
// +------------+     +-----------+  |
// | TERMINATED | <-- |  STAGED   |  |
// +------------+     +-----------+  |
//   ^                  |            |
//   |                  |            |
//   |                  v            |
//   |                +-----------+  |
//   |                | SUBMITTED | -+
//   |                +-----------+
//   |                  |
//   |                  |
//   |                  v
//   |                +-----------+
//   +--------------- |  STARTED  |
//                    +-----------+
//                      |
//                      |
//                      v
//                    +-----------+
//                    |  STOPPED  |
//                    +-----------+

export enum JobState {
    STAGED = 'STAGED',
    SUBMITTED = 'SUBMITTED',
    STARTED = 'STARTED',
    STOPPED = 'STOPPED',
    TERMINATED = 'TERMINATED',
}

export const JobStateSchema = z.nativeEnum(JobState);

interface Current {
    readonly current: JobState;
}

interface ToSubmitted {
    toSubmitted: () => OnSubmitted;
}

interface ToStarted {
    toStarted: () => OnStarted;
}

interface ToStopped {
    toStopped: () => OnStopped;
}

interface ToTerminated {
    toTerminated: () => OnTerminated;
}

type OnStaged = Current & ToSubmitted & ToTerminated;
type OnSubmitted = Current & ToStarted & ToTerminated;
type OnStarted = Current & ToStopped & ToTerminated;
type OnStopped = Current;
type OnTerminated = Current;

const JobOnStaged: OnStaged = {
    current: JobState.STAGED,
    toSubmitted: () => JobOnSubmitted,
    toTerminated: () => JobOnTerminated,
};

const JobOnSubmitted: OnSubmitted = {
    current: JobState.SUBMITTED,
    toStarted: () => JobOnStarted,
    toTerminated: () => JobOnTerminated,
};

const JobOnStarted: OnStarted = {
    current: JobState.STARTED,
    toStopped: () => JobOnStopped,
    toTerminated: () => JobOnTerminated,
};

const JobOnStopped: OnStopped = {
    current: JobState.STOPPED,
};

const JobOnTerminated: OnTerminated = {
    current: JobState.TERMINATED,
};

export const initJobOn = () => JobOnStaged;

export const TerminatedDescriptionSchema = z.object({
    timestamp: z.number().readonly(),
    error: z.instanceof(Error),
});

export type TerminatedDescription = Readonly<
    z.infer<typeof TerminatedDescriptionSchema>
>;

export const JobInfoSchema = z.object({
    job: JobSchema.readonly(),
    stageTime: z.number().readonly(),
    submitTime: z.number().readonly().optional(),
    startTime: z.number().readonly().optional(),
    stopTime: z.number().readonly().optional(),
    attempt: z.number().readonly().optional(),
    status: JobStateSchema.readonly(),
    terminatedDescription: TerminatedDescriptionSchema.readonly().optional(),
});

export type JobInfo = Readonly<
    Omit<
        z.infer<typeof JobInfoSchema>,
        'job' | 'status' | 'terminatedDescription'
    > & {
        job: Job;
    } & {
        status: JobState;
    } & {
        terminatedDescription?: TerminatedDescription;
    }
>;
