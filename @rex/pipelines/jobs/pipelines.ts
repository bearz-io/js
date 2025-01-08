import type { ExecutionContext, LoggingMessageBus } from "@rex/primitives";
import { type PipelineStatus, type TaskHandlerRegistry, toError } from "@rex/tasks";
import type { Job, JobContext, JobMap, JobResult } from "@rex/jobs";
import { type Next, Pipeline } from "../pipeline.ts";

/**
 * The context for a job pipeline.
 */
export interface JobPipelineContext extends JobContext {
    /**
     * The result of the job.
     */
    result: JobResult;
    /**
     * The job to run.
     */
    job: Job;
    /**
     * The message bus responsible for handling key event messages
     * for the UI and other consumers to handle.
     */
    bus: LoggingMessageBus;
    /**
     * The status of the pipeline.
     */
    status: PipelineStatus;
    /**
     * The task handler registry.
     */
    registry: TaskHandlerRegistry;

    /**
     * The environment name which is passed by the cli's context option.
     */
    environmentName: "development" | "staging" | "production" | "test" | "default" | string;

    /**
     * The arguments passed to the job from the command line.
     */
    args?: string[];
}

/**
 * The job pipeline middleware.
 */
export abstract class JobPipelineMiddleware {
    /**
     * Runs the middleware.
     * @param ctx The job pipeline context.
     * @param next The next middleware.
     */
    abstract run(ctx: JobPipelineContext, next: Next): Promise<void>;
}

/**
 * The job pipeline.
 */
export class JobPipeline extends Pipeline<JobResult, JobPipelineContext> {
    /**
     * Creates a new JobPipeline.
     */
    constructor() {
        super();
    }

    /**
     * Adds the specified middleware to the job pipeline.
     * @param middleware The middleware to use.
     * @returns A reference to the job pipeline instance for chaining.
     */
    override use(
        middleware:
            | JobPipelineMiddleware
            | ((ctx: JobPipelineContext, next: Next) => void | Promise<void>),
    ): this {
        if (middleware instanceof JobPipelineMiddleware) {
            return super.use(middleware.run.bind(middleware));
        }

        return super.use(middleware);
    }

    /**
     * Runs the job pipeline.
     * @param ctx The context to run the job pipeline with.
     * @returns The result of the job pipeline
     */
    override async run(ctx: JobPipelineContext): Promise<JobResult> {
        try {
            await this.pipe(ctx);
            return ctx.result;
        } catch (error) {
            ctx.status = "failure";
            const e = toError(error);
            ctx.result.fail(e);
            ctx.bus.error(e);
            return ctx.result;
        }
    }
}

/**
 * The context for a jobs pipeline.
 */
export interface JobsPipelineContext extends ExecutionContext {
    /**
     * The jobs to run.
     */
    jobs: JobMap;
    /**
     * The task handler registry.
     */
    registry: TaskHandlerRegistry;
    /**
     * The results of the jobs.
     */
    results: JobResult[];
    /**
     * The status of the pipeline.
     */
    status: PipelineStatus;
    /**
     * The error that occurred.
     */
    error?: Error;

    /**
     * The message bus responsible for handling key event messages
     * for the UI and other consumers to handle.
     */
    bus: LoggingMessageBus;

    /**
     * The targets (job ids) to run.
     */
    targets: string[];

    /**
     * The environment name which is passed by the cli's context option.
     */
    environmentName: "development" | "staging" | "production" | "test" | "local" | string;

    /**
     * The arguments passed to the job from the command line.
     */
    args?: string[];
}

/**
 * The summary of the jobs pipeline.
 */
export interface JobsSummary extends Record<string, unknown> {
    /**
     * The results of the jobs that were run.
     */
    results: JobResult[];
    /**
     * The error that occurred during the pipeline.
     */
    error?: Error;
    /**
     * The status of the pipeline
     */
    status: PipelineStatus;
}

/**
 * The jobs pipeline middleware.
 */
export abstract class JobsPipelineMiddleware {
    abstract run(ctx: JobsPipelineContext, next: Next): Promise<void>;
}

/**
 * The sequential jobs pipeline that runs jobs in order
 */
export class SequentialJobsPipeline extends Pipeline<JobsSummary, JobsPipelineContext> {
    /**
     * Creates a new SequentialJobsPipeline.
     */
    constructor() {
        super();
    }

    /**
     * Adds the specified middleware to the jobs pipeline.
     * @param middleware The middleware to use.
     * @returns A reference to the jobs pipeline instance for chaining.
     */
    override use(
        middleware:
            | JobsPipelineMiddleware
            | ((ctx: JobsPipelineContext, next: Next) => void | Promise<void>),
    ): this {
        if (middleware instanceof JobsPipelineMiddleware) {
            return super.use(middleware.run.bind(middleware));
        }

        return super.use(middleware);
    }

    /**
     * Runs the jobs pipeline.
     * @param ctx The context to run the jobs pipeline with.
     * @returns The summary of the jobs pipeline.
     */
    override async run(ctx: JobsPipelineContext): Promise<JobsSummary> {
        try {
            await this.pipe(ctx);
            return {
                results: ctx.results,
                status: ctx.status,
                error: ctx.error,
            };
        } catch (error) {
            ctx.status = "failure";
            const e = toError(error);
            ctx.error = e;
            return {
                results: ctx.results,
                status: ctx.status,
                error: e,
            };
        }
    }
}
