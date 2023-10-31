import { JobInfo, JobState } from '@pine/common';

export type RunerApi = {
    start: () => boolean;
    stop: () => boolean;
    kill: () => boolean;
    status: () => JobState;
    info: () => JobInfo;
};
