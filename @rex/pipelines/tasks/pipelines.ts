import type { ExecutionContext, LoggingMessageBus } from "@rex/primitives";
import {
    type PipelineStatus,
    type Task,
    type TaskContext,
    type TaskHandlerRegistry,
    type TaskMap,
    type TaskResult,
    toError,
} from "@rex/tasks";
import { type Next, Pipeline } from "../pipeline.ts";

/**
 * The context for a task pipeline.
 */
export interface TaskPipelineContext extends TaskContext {
    /**
     * The result of the task.
     */
    result: TaskResult;
    /**
     * The task to run.
     */
    task: Task;
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
}

/**
 * The task pipeline middleware.
 */
export abstract class TaskPipelineMiddleware {
    /**
     * Runs the middleware.
     * @param ctx The task pipeline context.
     * @param next The next middleware.
     */
    abstract run(ctx: TaskPipelineContext, next: Next): Promise<void>;
}

/**
 * The task pipeline.
 */
export class TaskPipeline extends Pipeline<TaskResult, TaskPipelineContext> {
    /**
     * Creates a new task pipeline.
     */
    constructor() {
        super();
    }

    /**
     * Uses the specified middleware to run the task pipeline.
     * @param middleware The middleware to use.
     * @returns A reference to the task pipeline instance for chaining.
     */
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

    /**
     * Runs the task pipeline.
     * @param ctx The context to run the task pipeline with.
     * @returns The result of the task pipeline.
     */
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

/**
 * The context for a tasks pipeline where multiple tasks are run in sequence.
 */
export interface TasksPipelineContext extends ExecutionContext {
    /**
     * The collection of tasks to run.
     */
    tasks: TaskMap;
    /**
     * The task handler registry.
     */
    registry: TaskHandlerRegistry;
    /**
     * The results of the tasks that were run.
     */
    results: TaskResult[];
    /**
     * The status of the pipeline.
     */
    status: PipelineStatus;
    /**
     * The error that occurred during the pipeline.
     */
    error?: Error;
    /**
     * The message bus responsible for handling key event messages
     * for the UI and other consumers to handle.
     */
    bus: LoggingMessageBus;
    /**
     * The targets (task ids) to run.
     */
    targets: string[];
    /**
     * The environment name which is passed by the cli's context option.
     */
    environmentName: "development" | "staging" | "production" | "test" | "default" | string;

    /**
     * The arguments from the cli to pass to the tasks.
     */
    args?: string[];
}

/**
 * The summary of the tasks pipeline.
 */
export interface TasksSummary extends Record<string, unknown> {
    /**
     * The results of the tasks that were run.
     */
    results: TaskResult[];

    /**
     * The error that occurred during the pipeline.
     */
    error?: Error;

    /**
     * The status of the pipeline.
     */
    status: PipelineStatus;
}

/**
 * The tasks pipeline middleware.
 */
export abstract class TasksPipelineMiddleware {
    abstract run(ctx: TasksPipelineContext, next: Next): Promise<void>;
}

/**
 * The tasks pipeline that runs in order.
 */
export class SequentialTasksPipeline extends Pipeline<TasksSummary, TasksPipelineContext> {
    /**
     * Creates a new SequentialTasksPipeline.
     */
    constructor() {
        super();
    }

    /**
     * Uses the specified middleware to run the tasks pipeline.
     * @param middleware The middleware to use.
     * @returns A reference to the tasks pipeline instance for chaining
     */
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

    /**
     * Runs the tasks pipeline.
     * @param ctx The context to run the tasks pipeline with.
     * @returns The summary of the tasks pipeline
     */
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
