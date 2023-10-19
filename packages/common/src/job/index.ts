import { RunnerSpec } from '../runner';

export type Job = {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly use: string; // runner token
    readonly with: RunnerSpec; // runner spec
};

export type JobState = 'SUBMITTED' | 'STARTED' | 'STOPPED' | 'TERMINATED';

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
