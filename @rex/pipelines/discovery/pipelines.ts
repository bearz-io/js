import { type Next, Pipeline } from "../pipeline.ts";
import type { ExecutionContext, LoggingMessageBus } from "@rex/primitives";
import { type TaskMap, toError } from "@rex/tasks";
import type { JobMap } from "@rex/jobs";
import type { DeploymentMap } from "@rex/deployments";

/**
 * The context for a discovery pipeline.
 */
export interface DiscoveryPipelineContext extends ExecutionContext {
    /**
     * The global rex tasks.
     */
    tasks: TaskMap;
    /**
     * The global rex jobs.
     */
    jobs: JobMap;
    /**
     * The global rex deployments.
     */
    deployments: DeploymentMap;
    /**
     * The file to discover.
     */
    file?: string;
    /**
     * The setup function.
     */
    setup?: (ctx: ExecutionContext) => Promise<void> | void;
    /**
     * The teardown function.
     */
    teardown?: (ctx: ExecutionContext) => Promise<void> | void;
    /**
     * The message bus responsible for handling key event messages
     * for the UI and other consumers to handle.
     */
    bus: LoggingMessageBus;

    /**
     * The error that occurred during discovery.
     */
    error?: Error;
}

/**
 * The result of a discovery pipeline.
 */
export interface DicoveryPipelineResult {
    /**
     * The tasks discovered.
     */
    tasks: TaskMap;
    /**
     * The jobs discovered.
     */
    jobs: JobMap;
    /**
     * The deployments discovered.
     */
    deployments: DeploymentMap;
    /**
     * The error that occurred during discovery.
     */
    error?: Error;
    /**
     * The initial rexfile file.
     */
    file: string;
}

/**
 * Represents middleware for a discovery pipeline.
 */
export abstract class DiscoveryPipelineMiddleware {
    /**
     * Runs the middleware.
     * @param ctx The discovery pipeline context.
     * @param next The next middleware.
     */
    abstract run(ctx: DiscoveryPipelineContext, next: Next): Promise<void>;
}

/**
 * A discovery pipeline that can be used to discover tasks, jobs, and deployments.
 */
export class DiscoveryPipeline extends Pipeline<DicoveryPipelineResult, DiscoveryPipelineContext> {
    /**
     * Creates a new DiscoveryPipeline.
     */
    constructor() {
        super();
    }

    /**
     * Adds the specified middleware to the discovery pipeline.
     * @param middleware The middleware to use.
     * @returns A reference to the discovery pipeline instance for chaining.
     */
    override use(
        middleware:
            | DiscoveryPipelineMiddleware
            | ((ctx: DiscoveryPipelineContext, next: Next) => void | Promise<void>),
    ): this {
        if (middleware instanceof DiscoveryPipelineMiddleware) {
            return super.use(middleware.run.bind(middleware));
        }

        return super.use(middleware);
    }

    /**
     * Runs the discovery pipeline.
     *
     * @param context The context to run the discovery pipeline with.
     * @returns The result of the discovery pipeline.
     */
    override async run(context: DiscoveryPipelineContext): Promise<DicoveryPipelineResult> {
        try {
            const ctx = await this.pipe(context);
            return {
                tasks: ctx.tasks,
                jobs: ctx.jobs,
                deployments: ctx.deployments,
                file: ctx.file ?? "",
                error: ctx.error,
            };
        } catch (error) {
            const e = toError(error);
            return {
                tasks: context.tasks,
                jobs: context.jobs,
                deployments: context.deployments,
                error: e,
                file: context.file ?? "",
            };
        }
    }
}
