import { Job, JobInfo, JobState } from '@pine/common/job';

export type WorkerService = {
    submit: (job: Job) => string;
    start: (jobId: string) => void;
    run: (job: Job) => string; // submit + start
    stop: (jobId: string) => void;
    restart: (jobId: string) => void;
    delete: (jobId: string) => void;
    status: (jobId: string) => JobState;
    list: () => JobInfo[];
    get: (jobId: string) => JobInfo;
};
