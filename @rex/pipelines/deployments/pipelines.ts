import type { ExecutionContext, LoggingMessageBus } from "@rex/primitives";
import { type PipelineStatus, type TaskRegistry, toError } from "@rex/tasks";
import type {
    Deployment,
    DeploymentContext,
    DeploymentMap,
    DeploymentRegistry,
    DeploymentResult,
} from "@rex/deployments";
import { type Next, Pipeline } from "../pipeline.ts";

export interface DeploymentPipelineContext extends DeploymentContext {
    result: DeploymentResult;
    deployment: Deployment;
    bus: LoggingMessageBus;
    status: PipelineStatus;
    tasksRegistry: TaskRegistry;
    deploymentsRegistry: DeploymentRegistry;
}

export abstract class DeploymentPipelineMiddleware {
    abstract run(ctx: DeploymentPipelineContext, next: Next): Promise<void>;
}

export class DeploymentPipeline extends Pipeline<DeploymentResult, DeploymentPipelineContext> {
    constructor() {
        super();
    }

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

export interface DeploymentsPipelineContext extends ExecutionContext {
    tasks: DeploymentMap;
    deploymentsRegistry: DeploymentRegistry;
    tasksRegistry: TaskRegistry;
    results: DeploymentResult[];
    status: PipelineStatus;
    error?: Error;
    bus: LoggingMessageBus;
    targets: string[];
    environmentName: "development" | "staging" | "production" | "test" | "local" | string;
}

export interface DeploymentsSummary extends Record<string, unknown> {
    results: DeploymentResult[];
    error?: Error;
    status: PipelineStatus;
}

export abstract class DeploymentsPipelineMiddleware {
    abstract run(ctx: DeploymentsPipelineContext, next: Next): Promise<void>;
}

export class SequentialDeploymentsPipeline
    extends Pipeline<DeploymentsSummary, DeploymentsPipelineContext> {
    constructor() {
        super();
    }

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
