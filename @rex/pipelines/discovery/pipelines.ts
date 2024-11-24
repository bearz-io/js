import { type Next, Pipeline } from "../pipeline.ts";
import type { ExecutionContext, LoggingMessageBus } from "@rex/primitives";
import { type TaskMap, toError } from "@rex/tasks";
import type { JobMap } from "@rex/jobs";
import type { DeploymentMap } from "@rex/deployments";

export interface DiscoveryPipelineContext extends ExecutionContext {
    tasks: TaskMap;
    jobs: JobMap;
    deployments: DeploymentMap;
    file?: string;
    setup?: (ctx: ExecutionContext) => Promise<void> | void;
    teardown?: (ctx: ExecutionContext) => Promise<void> | void;
    bus: LoggingMessageBus;
    error?: Error;
}

export interface DicoveryPipelineResult {
    tasks: TaskMap;
    jobs: JobMap;
    deployments: DeploymentMap;
    error?: Error;
    file: string;
}

export abstract class DiscoveryPipelineMiddleware {
    abstract run(ctx: DiscoveryPipelineContext, next: Next): Promise<void>;
}

export class DiscoveryPipeline extends Pipeline<DicoveryPipelineResult, DiscoveryPipelineContext> {
    constructor() {
        super();
    }

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
