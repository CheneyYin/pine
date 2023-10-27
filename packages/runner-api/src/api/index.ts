import { JobInfo, JobState } from 'packages/common/dist';

export type RunerApi = {
    start: () => boolean;
    stop: () => boolean;
    kill: () => boolean;
    status: () => JobState;
    info: () => JobInfo;
};
