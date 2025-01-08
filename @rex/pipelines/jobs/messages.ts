import { BaseMessage } from "../bus.ts";
import type { Job, JobMap, JobResult, JobState } from "@rex/jobs";

/**
 * Job started message
 */
export class JobStarted extends BaseMessage {
    /**
     * Creates a new JobStarted message.
     * @param job The job state.
     */
    constructor(public readonly job: JobState) {
        super("job:started");
    }
}

/**
 * Job completed message
 */
export class JobCompleted extends BaseMessage {
    /**
     * Creates a new JobCompleted message.
     * @param job The job state.
     * @param result The job result.
     */
    constructor(public readonly job: JobState, public readonly result: JobResult) {
        super("job:completed");
    }
}

/**
 * Job skipped message
 */
export class JobSkipped extends BaseMessage {
    /**
     * Creates a new JobSkipped message.
     * @param job The job state.
     */
    constructor(public readonly job: JobState) {
        super("job:skipped");
    }
}

/**
 * Job failed message
 */
export class JobFailed extends BaseMessage {
    /**
     * Creates a new JobFailed message.
     * @param job The job state.
     * @param error The error.
     */
    constructor(public readonly job: JobState, public readonly error: Error) {
        super("job:failed");
    }
}

/**
 * Job cancelled message
 */
export class JobCancelled extends BaseMessage {
    /**
     * Creates a new JobCancelled message.
     * @param job The job state.
     * @param reason The reason the job was cancelled.
     */
    constructor(public readonly job: JobState, public readonly reason = "cancelled") {
        super("job:cancelled");
    }
}

/**
 * Job not found message
 */
export class MissingJobDependencies extends BaseMessage {
    /**
     * Creates a new MissingJobDependencies message.
     * @param jobs The jobs with missing dependencies.
     */
    constructor(public readonly jobs: Array<{ job: Job; missing: string[] }>) {
        super("jobs:missing-dependencies");
    }
}

/**
 * Job cyclical references message
 */
export class CyclicalJobReferences extends BaseMessage {
    /**
     * Creates a new CyclicalJobReferences message.
     * @param jobs The jobs with cyclical references.
     */
    constructor(public readonly jobs: Job[]) {
        super("jobs:cyclical-references");
    }
}

/**
 * Job not found message
 */
export class JobNotFound extends BaseMessage {
    /**
     * Creates a new JobNotFound message.
     * @param jobName The name of the job.
     */
    constructor(public readonly jobName: string) {
        super("job:not-found");
    }
}

/**
 * List jobs message
 */
export class ListJobs extends BaseMessage {
    /**
     * Creates a new ListJobs message.
     * @param jobs The jobs.
     */
    constructor(public readonly jobs: JobMap) {
        super("jobs:list");
    }
}
