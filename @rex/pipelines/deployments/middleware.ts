import { ObjectMap, Outputs, StringMap } from "@rex/primitives";
import type { TasksPipelineContext } from "../mod.ts";
import type { Next } from "../pipeline.ts";
import type { SequentialTasksPipeline } from "../tasks/pipelines.ts";
import {
    DeploymentCancelled,
    DeploymentCompleted,
    DeploymentFailed,
    DeploymentSkipped,
    DeploymentStarted,
} from "./messages.ts";
import { type DeploymentPipelineContext, DeploymentPipelineMiddleware } from "./pipelines.ts";
import { REX_TASKS_REGISTRY, TaskMap } from "@rex/tasks";
import { underscore } from "@bearz/strings/underscore";
import { setPipelineVar } from "../ci/vars.ts";

export class ApplyDeploymentContext extends DeploymentPipelineMiddleware {
    override async run(ctx: DeploymentPipelineContext, next: Next): Promise<void> {
        const meta = ctx.state;
        const task = ctx.deployment;
        const directive = ctx.directive;

        try {
            meta.env.merge(ctx.env);

            if (typeof task.cwd === "string") {
                meta.cwd = task.cwd;
            } else if (typeof task.cwd === "function") {
                meta.cwd = await task.cwd(ctx);
            }

            if (typeof task.timeout === "number") {
                meta.timeout = task.timeout;
            } else if (typeof task.timeout === "function") {
                meta.timeout = await task.timeout(ctx);
            }

            if (typeof task.force === "boolean") {
                meta.force = task.force;
            } else if (typeof task.force === "function") {
                meta.force = await task.force(ctx);
            }

            if (typeof task.if === "boolean") {
                meta.if = task.if;
            } else if (typeof task.if === "function") {
                meta.if = await task.if(ctx);
            }

            if (typeof task.env === "function") {
                const e = await task.env(ctx);
                meta.env.merge(e);
            } else if (typeof task.env === "object") {
                const e = task.env;
                meta.env.merge(e);
            }

            if (typeof task.with === "function") {
                meta.inputs = await task.with(ctx);
            } else if (typeof task.with !== "undefined") {
                meta.inputs = task.with;
            }

            await next();
        } catch (e) {
            ctx.result.stop();
            if (!(e instanceof Error)) {
                const e2 = new Error(`Unknown error: ${e}`);
                ctx.result.fail(e2);
                ctx.bus.send(new DeploymentFailed(meta, e2, directive));
                return;
            }
            ctx.result.fail(e);
            ctx.bus.send(new DeploymentFailed(meta, e, directive));

            return;
        }
    }
}

export class RunDeployment extends DeploymentPipelineMiddleware {
    override async run(ctx: DeploymentPipelineContext, next: Next): Promise<void> {
        const { state } = ctx;
        const directive = ctx.directive;

        if (ctx.signal.aborted) {
            ctx.result.cancel();
            ctx.result.stop();
            ctx.bus.send(new DeploymentCancelled(ctx.state, directive));
            return;
        }

        if (ctx.status === "failure" || ctx.status === "cancelled" && !state.force) {
            ctx.result.skip();
            ctx.result.stop();
            ctx.bus.send(new DeploymentSkipped(ctx.state, directive));
            return;
        }

        if (state.if === false) {
            ctx.result.skip();
            ctx.result.stop();
            ctx.bus.send(new DeploymentSkipped(ctx.state, directive));
            return;
        }

        let timeout = state.timeout;
        if (timeout === 0) {
            timeout = ctx.services.get("timeout") as number ?? (60 * 1000) * 3;
        } else {
            timeout = timeout * 1000;
        }

        const controller = new AbortController();
        const onAbort = () => {
            controller.abort();
        };
        ctx.signal.addEventListener("abort", onAbort, { once: true });
        const signal = controller.signal;
        const listener = () => {
            ctx.result.cancel();
            ctx.result.stop();
            ctx.bus.send(new DeploymentCancelled(ctx.state, directive));
        };

        signal.addEventListener("abort", listener, { once: true });
        const handle = setTimeout(() => {
            controller.abort();
        }, timeout);

        const descriptor = ctx.deploymentsRegistry.get(ctx.deployment.uses);
        if (!descriptor) {
            throw new Error(`Task kind '${ctx.deployment.uses}' not found.`);
        }

        for (const key of Object.keys(ctx.deployment.hooks)) {
            const tasks = ctx.deployment.hooks[key];
            if (!tasks || tasks.length === 0) {
                continue;
            }

            if (descriptor.events.includes(key)) {
                ctx.events[key] = async (c) => {
                    const map = new TaskMap();
                    for (const task of tasks) {
                        map.set(task.id, task);
                    }

                    const targets = tasks.map((t) => t.id);

                    const tasksCtx: TasksPipelineContext = {
                        bus: ctx.bus,
                        environmentName: c.environmentName,
                        outputs: new Outputs().merge(ctx.outputs),
                        env: new StringMap().merge(ctx.env),
                        variables: new ObjectMap().merge(ctx.variables),
                        cwd: c.cwd,
                        tasks: map,
                        targets,
                        registry: REX_TASKS_REGISTRY,
                        results: [],
                        status: "success",
                        secrets: new StringMap().merge(ctx.secrets),
                        services: ctx.services,
                        signal: ctx.signal,
                        writer: ctx.writer,
                        error: undefined,
                        args: ctx.args,
                    };

                    const pipeline = ctx.services.get(
                        "SequentialTasksPipeline",
                    ) as SequentialTasksPipeline;
                    if (!pipeline) {
                        throw new Error(`Service 'SequentialTasksPipeline' not found.`);
                    }

                    const results = await pipeline.run(tasksCtx);

                    for (const [key, value] of tasksCtx.secrets) {
                        if (ctx.secrets.has(key)) {
                            const old = ctx.secrets.get(key);
                            if (old !== value) {
                                ctx.writer.debug(
                                    `Secret ${key} has changed in deployment ${c.state.id}`,
                                );
                                ctx.secrets.set(key, value);
                                ctx.writer.secretMasker.add(value);
                                const envName = underscore(key, { screaming: true });
                                ctx.env.set(envName, value);
                                setPipelineVar(envName, value, { secret: true });
                            }
                        } else {
                            ctx.writer.debug(`Secret ${key} was added in deployment ${c.state.id}`);
                            ctx.secrets.set(key, value);
                            ctx.writer.secretMasker.add(value);
                            const envName = underscore(key, { screaming: true });
                            ctx.env.set(envName, value);
                            setPipelineVar(envName, value, { secret: true });
                        }
                    }

                    for (const [key, value] of tasksCtx.env) {
                        if (ctx.env.has(key)) {
                            const old = ctx.env.get(key);
                            if (old !== value) {
                                ctx.writer.debug(
                                    `Env ${key} has changed in deployment ${c.state.id}`,
                                );
                                ctx.env.set(key, value);
                                setPipelineVar(key, value);
                            }
                        } else {
                            ctx.writer.debug(`Env ${key} has changed in deployment ${c.state.id}`);
                            ctx.env.set(key, value);
                            setPipelineVar(key, value);
                        }
                    }

                    return {
                        status: results.status,
                        results: results.results,
                        error: results.error,
                    };
                };
            }
        }

        try {
            ctx.result.start();

            if (ctx.signal.aborted) {
                ctx.result.cancel();
                ctx.result.stop();
                ctx.bus.send(new DeploymentCancelled(ctx.state, directive));
                return;
            }

            ctx.bus.send(new DeploymentStarted(ctx.state, directive));
            const result = await descriptor.run(ctx);
            ctx.result.stop();
            if (result.isError) {
                ctx.result.stop();
                ctx.result.fail(result.unwrapError());
                ctx.bus.send(new DeploymentFailed(ctx.state, result.unwrapError(), directive));
                return;
            }

            if (ctx.signal.aborted) {
                ctx.result.cancel();
                ctx.result.stop();
                ctx.bus.send(new DeploymentCancelled(ctx.state, directive));
                return;
            }

            ctx.result.success();
            ctx.result.outputs = result.unwrap();
            ctx.bus.send(new DeploymentCompleted(ctx.state, ctx.result, directive));
        } finally {
            clearTimeout(handle);
            signal.removeEventListener("abort", listener);
            ctx.signal.removeEventListener("abort", onAbort);
        }

        await next();
    }
}
