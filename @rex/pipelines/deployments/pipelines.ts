import type { ExecutionContext, LoggingMessageBus } from "@rex/primitives";
import { type PipelineStatus, type TaskHandlerRegistry, toError } from "@rex/tasks";
import type {
    Deployment,
    DeploymentContext,
    DeploymentHandlerRegistry,
    DeploymentMap,
    DeploymentResult,
} from "@rex/deployments";
import { type Next, Pipeline } from "../pipeline.ts";

/**
 * The context for a deployment pipeline.
 */
export interface DeploymentPipelineContext extends DeploymentContext {
    /**
     * The result of the deployment.
     */
    result: DeploymentResult;
    /**
     * The deployment to run.
     */
    deployment: Deployment;
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
    tasksRegistry: TaskHandlerRegistry;
    /**
     * The deployment handler registry.
     */
    deploymentsRegistry: DeploymentHandlerRegistry;
}

/**
 * Respresents middleware for a deployment pipeline.
 */
export abstract class DeploymentPipelineMiddleware {
    /**
     * Runs the middleware.
     * @param ctx The deployment pipeline context.
     * @param next The next middleware.
     */
    abstract run(ctx: DeploymentPipelineContext, next: Next): Promise<void>;
}

/**
 * A deployment pipeline that can be used to deploy a deployment.
 */
export class DeploymentPipeline extends Pipeline<DeploymentResult, DeploymentPipelineContext> {
    /**
     * Creates a new DeploymentPipeline.
     */
    constructor() {
        super();
    }

    /**
     * Uses the specified middleware to run the deployment pipeline.
     * @param middleware The middleware to use.
     * @returns A reference to the deployment pipeline instance for chaining.
     */
    override use(
        middleware:
            | DeploymentPipelineMiddleware
            | ((ctx: DeploymentPipelineContext, next: Next) => void | Promise<void>),
    ): this {
        if (middleware instanceof DeploymentPipelineMiddleware) {
            return super.use(middleware.run.bind(middleware));
        }

        return super.use(middleware);
    }

    /**
     * Runs the deployment pipeline.
     * @param ctx The deployment pipeline context.
     * @returns The result of the deployment pipeline.
     */
    override async run(ctx: DeploymentPipelineContext): Promise<DeploymentResult> {
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
 * The context for a deployments pipeline.
 */
export interface DeploymentsPipelineContext extends ExecutionContext {
    /**
     * The deployments to run.
     */
    tasks: DeploymentMap;
    /**
     * The deployment handler registry.
     */
    deploymentsRegistry: DeploymentHandlerRegistry;
    /**
     * The task handler registry.
     */
    tasksRegistry: TaskHandlerRegistry;
    /**
     * The results of the deployments that were run.
     */
    results: DeploymentResult[];
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
     */
    bus: LoggingMessageBus;
    /**
     * The targets (deployment ids) to run.
     */
    targets: string[];
    /**
     * The environment name which is passed by the cli's context option.
     */
    environmentName: "development" | "staging" | "production" | "test" | "default" | string;
}

/**
 * Respresents middleware for a deployments pipeline.
 */
export interface DeploymentsSummary extends Record<string, unknown> {
    /**
     * The results of the deployments.
     */
    results: DeploymentResult[];
    /**
     * The status of the pipeline.
     */
    error?: Error;
    /**
     * The error that occurred during the pipeline.
     */
    status: PipelineStatus;
}

/**
 * Respresents middleware for a deployments pipeline.
 */
export abstract class DeploymentsPipelineMiddleware {
    /**
     * Runs the middleware.
     * @param ctx The deployments pipeline context.
     * @param next The next middleware.
     */
    abstract run(ctx: DeploymentsPipelineContext, next: Next): Promise<void>;
}

/**
 * A deployments pipeline that can be used to deploy a deployment.
 */
export class SequentialDeploymentsPipeline
    extends Pipeline<DeploymentsSummary, DeploymentsPipelineContext> {
    /**
     * Creates a new DeploymentPipeline.
     */
    constructor() {
        super();
    }

    /**
     * Uses the specified middleware to run the deployment pipeline.
     * @param middleware The middleware to use.
     * @returns A reference to the deployment pipeline instance for chaining.
     */
    override use(
        middleware:
            | DeploymentsPipelineMiddleware
            | ((ctx: DeploymentsPipelineContext, next: Next) => void | Promise<void>),
    ): this {
        if (middleware instanceof DeploymentsPipelineMiddleware) {
            return super.use(middleware.run.bind(middleware));
        }

        return super.use(middleware);
    }

    /**
     * Runs the deployment pipeline.
     * @param ctx The deployment pipeline context.
     * @returns The result of the deployment pipeline.
     */
    override async run(ctx: DeploymentsPipelineContext): Promise<DeploymentsSummary> {
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
