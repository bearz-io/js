import type { ExecutionContext, LoggingMessageBus } from "@rex/primitives";
import { type PipelineStatus, type TaskRegistry, toError } from "@rex/tasks";
import type { Job, JobContext, JobMap, JobResult } from "@rex/jobs";
import { type Next, Pipeline } from "../pipeline.ts";

export interface JobPipelineContext extends JobContext {
    result: JobResult;
    job: Job;
    bus: LoggingMessageBus;
    status: PipelineStatus;
    registry: TaskRegistry;
    environmentName: "development" | "staging" | "production" | "test" | "local" | string;
}

export abstract class JobPipelineMiddleware {
    abstract run(ctx: JobPipelineContext, next: Next): Promise<void>;
}

export class JobPipeline extends Pipeline<JobResult, JobPipelineContext> {
    constructor() {
        super();
    }

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

export interface JobsPipelineContext extends ExecutionContext {
    jobs: JobMap;
    registry: TaskRegistry;
    results: JobResult[];
    status: PipelineStatus;
    error?: Error;
    bus: LoggingMessageBus;
    targets: string[];
    environmentName: "development" | "staging" | "production" | "test" | "local" | string;
}

export interface JobsSummary extends Record<string, unknown> {
    results: JobResult[];
    error?: Error;
    status: PipelineStatus;
}

export abstract class JobsPipelineMiddleware {
    abstract run(ctx: JobsPipelineContext, next: Next): Promise<void>;
}

export class SequentialJobsPipeline extends Pipeline<JobsSummary, JobsPipelineContext> {
    constructor() {
        super();
    }

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
