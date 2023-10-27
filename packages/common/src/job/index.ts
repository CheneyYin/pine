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
