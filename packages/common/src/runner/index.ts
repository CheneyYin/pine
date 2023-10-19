interface Spec {}

export type RunnerSpec = Spec;

export type IRunner = {
    token: string;
    spec: RunnerSpec;
    setup: () => void;
    start: () => void;
    stop: () => void;
    restart: () => void;
    forceStop: () => void;
};
