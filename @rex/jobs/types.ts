import { fail, ok, type Result } from "@bearz/functional";
import {
    type ExecutionContext,
    type Inputs,
    type Lookup,
    OrderedMap,
    Outputs,
    type StringMap,
} from "@rex/primitives";
import type { AddTaskDelegate, PipelineStatus, Task, TaskResult } from "@rex/tasks";

/**
 * A job is a collection of tasks that are executed in a in sequential order. If
 * a task fails, the job is considered failed. Any task dependencies specified
 * by the `needs` property are ignored when a task executes as part of a job.
 */
export interface Job extends Lookup {
    /**
     * The unique identifier of the job.
     */
    id: string;

    /**
     * The name of the job. Defaults to the id. The name is used in the output
     * of the job in the UI.
     */
    name?: string;

    /**
     * The current working directory for the job. If not specified, the current
     * working directory of the process is used.  Functions are used to resolve
     * late bound values.
     */
    cwd?: string | ((ctx: JobContext) => string | Promise<string>);

    /**
     * The inputs for the job. Functions are used to resolve late bound values.
     */
    with?: Inputs | ((ctx: JobContext) => Inputs | Promise<Inputs>);

    /**
     * The environment variables for the job.
     */
    env?: StringMap | ((ctx: JobContext) => StringMap | Promise<StringMap>);

    /**
     * The timeout for the job in seconds.
     */
    timeout?: number | ((ctx: JobContext) => number | Promise<number>);

    /**
     * A condition that determines if the job should run.
     */
    if?: boolean | ((ctx: JobContext) => boolean | Promise<boolean>);

    /**
     * The tasks that are executed
     * as part of the job.
     */
    tasks: Task[];

    /**
     * The other jobs that this job depends on. These jobs are executed before
     * this job is executed.
     */
    needs?: string[];
}

export interface JobDef extends Lookup {
    /**
     * The name of the job. Defaults to the id. The name is used in the output
     * of the job in the UI.
     */
    name?: string;

    /**
     * The current working directory for the job. If not specified, the current
     * working directory of the process is used.  Functions are used to resolve
     * late bound values.
     */
    cwd?: string | ((ctx: JobContext) => string | Promise<string>);

    /**
     * The environment variables for the job.
     */
    env?: StringMap | ((ctx: JobContext) => StringMap | Promise<StringMap>);

    /**
     * The timeout for the job in seconds.
     */
    timeout?: number | ((ctx: JobContext) => number | Promise<number>);

    /**
     * A condition that determines if the job should run.
     */
    if?: boolean | ((ctx: JobContext) => boolean | Promise<boolean>);

    /**
     * The tasks that are executed
     * as part of the job.
     */
    tasks: Task[] | AddTaskDelegate;

    /**
     * The other jobs that this job depends on. These jobs are executed before
     * this job is executed.
     */
    needs?: string[];
}

/**
 * The context object that is passed to each job execution.
 */
export interface JobContext extends ExecutionContext {
    /**
     * The job that is being executed with all of its values resolved.
     */
    state: JobState;

    /**
     * The name of the environment that the job is running in. This is set by using
     * the context option in the ui.  The default value is `default`.
     */
    environmentName: "development" | "staging" | "production" | "test" | "default" | string;

    /**
     * The arguments that are passed to the job from the command line.
     */
    args?: string[];
}

/**
 * A job state is a job with all of its values resolved.
 */
export interface JobState extends Record<string, unknown> {
    /**
     * The unique identifier of the job.
     */
    id: string;

    /**
     * The name of the job. Defaults to the id. The name is used in the output
     * of the job in the UI.
     */
    name: string;

    /**
     * The current working directory for the job. If not specified, the current
     * working directory of the process is used.
     */
    cwd: string;

    /**
     * The inputs for the job.
     */
    inputs: Inputs;

    /**
     * The environment variables for the job.
     */
    env: StringMap;

    /**
     * The environment variable names assigned to the job.
     */
    envKeys: string[];

    /**
     * The set of tasks that are executed as part of the job.
     */
    tasks: Task[];

    /**
     * The other jobs that this job depends on. These jobs are executed before
     * this job is executed.
     */
    needs: string[];

    /**
     * The outputs of the job.
     */
    outputs: Outputs;

    /**
     * The condition that determines if the job should run.
     */
    if: boolean;

    /**
     * The timeout for the job in seconds.
     */
    timeout: number;
}

export class JobResult {
    /**
     * The outputs of the job.
     */
    outputs: Outputs;
    /**
     * The status of the job.
     */
    status: PipelineStatus;
    /**
     * The error that occurred during the job.
     */
    error?: Error;
    /**
     * The time that the job started.
     */
    startedAt: Date;
    /**
     * The time that the job finished.
     */
    finishedAt: Date;
    /**
     * The unique identifier of the job.
     */
    id: string;
    /**
     * The results of the tasks that were executed as
     * part of the job.
     */
    taskResults: TaskResult[];

    /**
     * Creates a new job result.
     * @param id The unique identifier of the job.
     */
    constructor(id: string) {
        this.id = id;
        this.outputs = new Outputs();
        this.status = "success";
        this.error = undefined;
        this.startedAt = new Date();
        this.finishedAt = this.startedAt;
        this.taskResults = [];
    }

    /**
     * Starts the job to record the start time.
     * @returns The instance of the job result.
     */
    start(): this {
        this.startedAt = new Date();
        return this;
    }

    /**
     * Stops the job to record the finish time.
     * @returns The instance of the job result.
     */
    stop(): this {
        this.finishedAt = new Date();
        return this;
    }

    /**
     * Sets the status of the job to 'failure' and records the error.
     * @param result The task result to add.
     * @returns The instance of the job result.
     */
    fail(err: Error): this {
        this.status = "failure";
        this.error = err;
        return this;
    }

    /**
     * Sets the status of the job to 'cancelled'.
     * @returns The instance of the job result.
     */
    cancel(): this {
        this.status = "cancelled";
        return this;
    }

    /**
     * Sets the status of the job to 'skipped'.
     * @returns The instance of the job result.
     */
    skip(): this {
        this.status = "skipped";
        return this;
    }

    /**
     * Sets the status of the job to 'success' and adds the outputs.
     * @param outputs The outputs to add to the job result.
     * @returns The instance of the job result.
     */
    success(outputs?: Record<string, unknown>): this {
        if (outputs) {
            this.outputs.merge(outputs);
        }
        return this;
    }
}

function flatten(map: JobMap, set: Job[]): Result<Job[]> {
    const results = new Array<Job>();
    for (const job of set) {
        if (!job) {
            continue;
        }

        const needs = job.needs ?? [];
        for (const dep of needs) {
            const depTask = map.get(dep);
            if (!depTask) {
                return fail(new Error(`Job ${job.id} depends on missing the missing job ${dep}`));
            }

            const depResult = flatten(map, [depTask]);
            if (depResult.isError) {
                return depResult;
            }

            results.push(...depResult.unwrap());
            if (!results.includes(depTask)) {
                results.push(depTask);
            }
        }

        if (!results.includes(job)) {
            results.push(job);
        }
    }

    return ok(results);
}

export class JobMap extends OrderedMap<string, Job> {
    constructor() {
        super();
    }

    /**
     * Finds any jobs that are missing dependencies.
     * @returns The list of jobs that are missing dependencies.
     */
    missingDependencies(): Array<{ job: Job; missing: string[] }> {
        const missing = new Array<{ job: Job; missing: string[] }>();
        for (const job of this.values()) {
            if (!job.needs) {
                continue;
            }

            const missingDeps = job.needs.filter((dep) => !this.has(dep));
            if (missingDeps.length > 0) {
                missing.push({ job, missing: missingDeps });
            }
        }
        return missing;
    }

    /**
     * Flattens the job map into a list of jobs in the order that they
     * should be executed.
     * @param targets The list of jobs to flatten. If not specified, all jobs are flattened.
     * @returns The list of jobs in the order that they should be
     */
    flatten(targets?: Job[]): Result<Job[]> {
        targets = targets ?? Array.from(this.values());
        return flatten(this, targets);
    }

    /**
     * Finds any cyclical references in the job map.
     * @returns The list of jobs that have cyclical references.
     */
    findCyclycalReferences(): Job[] {
        const stack = new Set<Job>();
        const cycles = new Array<Job>();
        const resolve = (job: Job) => {
            if (stack.has(job)) {
                return false;
            }

            stack.add(job);
            const needs = job.needs ?? [];
            for (const dep of needs) {
                const depTask = this.get(dep);
                if (!depTask) {
                    continue;
                }

                if (!resolve(depTask)) {
                    return false;
                }
            }

            stack.delete(job);

            return true;
        };

        for (const task of this.values()) {
            if (!resolve(task)) {
                // cycle detected
                cycles.push(task);
            }
        }

        // no cycles detected
        return cycles;
    }
}
