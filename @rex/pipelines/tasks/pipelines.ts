import type { ExecutionContext, LoggingMessageBus } from "@rex/primitives";
import {
    type PipelineStatus,
    type Task,
    type TaskContext,
    type TaskMap,
    type TaskRegistry,
    type TaskResult,
    toError,
} from "@rex/tasks";
import { type Next, Pipeline } from "../pipeline.ts";

export interface TaskPipelineContext extends TaskContext {
    result: TaskResult;
    task: Task;
    bus: LoggingMessageBus;
    status: PipelineStatus;
    registry: TaskRegistry;
    environmentName: "development" | "staging" | "production" | "test" | "local" | string;
}

export abstract class TaskPipelineMiddleware {
    abstract run(ctx: TaskPipelineContext, next: Next): Promise<void>;
}

export class TaskPipeline extends Pipeline<TaskResult, TaskPipelineContext> {
    constructor() {
        super();
    }

    override use(
        middleware:
            | TaskPipelineMiddleware
            | ((ctx: TaskPipelineContext, next: Next) => void | Promise<void>),
    ): this {
        if (middleware instanceof TaskPipelineMiddleware) {
            return super.use(middleware.run.bind(middleware));
        }

        return super.use(middleware);
    }

    override async run(ctx: TaskPipelineContext): Promise<TaskResult> {
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

export interface TasksPipelineContext extends ExecutionContext {
    tasks: TaskMap;
    registry: TaskRegistry;
    results: TaskResult[];
    status: PipelineStatus;
    error?: Error;
    bus: LoggingMessageBus;
    targets: string[];
    environmentName: "development" | "staging" | "production" | "test" | "local" | string;
    args?: string[];
}

export interface TasksSummary extends Record<string, unknown> {
    results: TaskResult[];
    error?: Error;
    status: PipelineStatus;
}

export abstract class TasksPipelineMiddleware {
    abstract run(ctx: TasksPipelineContext, next: Next): Promise<void>;
}

export class SequentialTasksPipeline extends Pipeline<TasksSummary, TasksPipelineContext> {
    constructor() {
        super();
    }

    override use(
        middleware:
            | TasksPipelineMiddleware
            | ((ctx: TasksPipelineContext, next: Next) => void | Promise<void>),
    ): this {
        if (middleware instanceof TasksPipelineMiddleware) {
            return super.use(middleware.run.bind(middleware));
        }

        return super.use(middleware);
    }

    override async run(ctx: TasksPipelineContext): Promise<TasksSummary> {
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
