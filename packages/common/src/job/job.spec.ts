import { JobState, initJobOn } from '../job';

describe(`test Job State Machine`, () => {
    test(`test state tranfer: ${JobState.STAGED} -> ${JobState.SUBMITTED} -> ${JobState.STARTED} -> ${JobState.STOPPED}`, () => {
        const init = initJobOn();
        expect(init.current).toBe(JobState.STAGED);

        const submitted = init.toSubmitted();
        expect(submitted.current).toBe(JobState.SUBMITTED);

        const started = submitted.toStarted();
        expect(started.current).toBe(JobState.STARTED);

        const stopped = started.toStopped();
        expect(stopped.current).toBe(JobState.STOPPED);
    });

    test(`test state tranfer: ${JobState.STAGED} -> ${JobState.TERMINATED}`, () => {
        const init = initJobOn();
        expect(init.current).toBe(JobState.STAGED);

        const terminated = init.toTerminated();
        expect(terminated.current).toBe(JobState.TERMINATED);
    });

    test(`test state tranfer: ${JobState.STAGED} -> ${JobState.SUBMITTED} -> ${JobState.TERMINATED}`, () => {
        const init = initJobOn();
        expect(init.current).toBe(JobState.STAGED);

        const submitted = init.toSubmitted();
        expect(submitted.current).toBe(JobState.SUBMITTED);

        const terminated = submitted.toTerminated();
        expect(terminated.current).toBe(JobState.TERMINATED);
    });

    test(`test state tranfer: ${JobState.STAGED} -> ${JobState.SUBMITTED} -> ${JobState.STARTED} -> ${JobState.TERMINATED}`, () => {
        const init = initJobOn();
        expect(init.current).toBe(JobState.STAGED);

        const submitted = init.toSubmitted();
        expect(submitted.current).toBe(JobState.SUBMITTED);

        const started = submitted.toStarted();
        expect(started.current).toBe(JobState.STARTED);

        const terminated = started.toTerminated();
        expect(terminated.current).toBe(JobState.TERMINATED);
    });
});
