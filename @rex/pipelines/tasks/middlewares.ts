import type { Next } from "../pipeline.ts";
import {
    CyclicalTaskReferences,
    MissingTaskDependencies,
    TaskCancelled,
    TaskCompleted,
    TaskFailed,
    TaskSkipped,
    TaskStarted,
} from "./messages.ts";
import {
    type TaskPipeline,
    type TaskPipelineContext,
    TaskPipelineMiddleware,
    type TasksPipelineContext,
    TasksPipelineMiddleware,
} from "./pipelines.ts";
import { underscore } from "@bearz/strings/underscore";
import { type Task, type TaskContext, TaskResult } from "@rex/tasks";
import { Inputs, Outputs, StringMap } from "@rex/primitives";
import { setPipelineVar } from "../ci/vars.ts";
import { AbortError, TimeoutError } from "@bearz/errors";

/**
 * Middleware that applies the task context to the pipeline by
 * resolving task properties and setting the task state.
 */
export class ApplyTaskContext extends TaskPipelineMiddleware {
    override async run(ctx: TaskPipelineContext, next: Next): Promise<void> {
        const meta = ctx.state;
        const task = ctx.task;
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
                meta.envKeys = e.keys().toArray();
                meta.env.merge(e);
            } else if (typeof task.env === "object") {
                const e = task.env;
                meta.envKeys = e.keys().toArray();
                meta.env.merge(e);
            }

            if (typeof task.with === "function") {
                meta.inputs = await task.with(ctx);
            } else if (typeof task.with !== "undefined") {
                meta.inputs = task.with;
            }

            const descriptor = ctx.registry.get(meta.uses);
            if (!descriptor) {
                const error = new Error(`Task not found: ${meta.uses}`);
                ctx.result.fail(error);
                ctx.bus.send(new TaskFailed(meta, error));
                return;
            }

            const required = descriptor.inputs.filter((o) => o.required).map((o) => o.name);

            if (meta.inputs.size > 0) {
                for (const [key, value] of meta.inputs.entries()) {
                    if (required.includes(key)) {
                        required.splice(required.indexOf(key), 1);
                    }

                    const name = "INPUT_" + underscore(key, { screaming: true });
                    let v = "";
                    if (value !== null && value !== undefined) {
                        v = value.toString();
                    }

                    meta.env.set(name, v);
                }

                if (required.length > 0) {
                    const error = new Error(
                        `Missing required inputs for task ${task.id}: ${required.join(", ")}`,
                    );
                    ctx.result.fail(error);
                    ctx.bus.send(new TaskFailed(meta, error));
                    return;
                }
            }

            await next();
        } catch (e) {
            ctx.result.stop();
            if (!(e instanceof Error)) {
                const e2 = new Error(`Unknown error: ${e}`);
                ctx.result.fail(e2);
                ctx.bus.send(new TaskFailed(meta, e2));
                return;
            }
            ctx.result.fail(e);
            ctx.bus.send(new TaskFailed(meta, e));

            return;
        }
    }
}

/**
 * Middleware that executes a task by running the task descriptor
 */
export class TaskExecution extends TaskPipelineMiddleware {
    override async run(ctx: TaskPipelineContext, next: Next): Promise<void> {
        const { state } = ctx;

        const descriptor = ctx.registry.get(state.uses);
        if (!descriptor) {
            const error = new Error(`Task not found: ${state.uses}`);
            ctx.result.fail(error);
            ctx.bus.send(new TaskFailed(ctx.state, error));
            return;
        }

        if (ctx.signal.aborted) {
            ctx.result.cancel();
            ctx.result.stop();
            let reason = "Task was cancelled";
            if (ctx.signal.reason instanceof Error) {
                reason = ctx.signal.reason.message;
            } else if (typeof ctx.signal.reason === "string") {
                reason = ctx.signal.reason;
            }

            ctx.bus.send(new TaskCancelled(ctx.state, reason));
            return;
        }

        if (ctx.status === "failure" || ctx.status === "cancelled" && !state.force) {
            ctx.result.skip();
            ctx.result.stop();
            ctx.bus.send(new TaskSkipped(ctx.state));
            return;
        }

        if (state.if === false) {
            ctx.result.skip();
            ctx.result.stop();
            ctx.bus.send(new TaskSkipped(ctx.state));
            return;
        }

        let timeout = state.timeout * 1000;
        if (timeout < 1) {
            timeout = 0;
        }
        let maxTimeout = ctx.services.get("timeout") as number ?? 0;
        if (maxTimeout < 1) {
            maxTimeout = 0;
        }

        if (timeout === 0 && maxTimeout > 0) {
            timeout = maxTimeout;
        } else if (timeout > 0 && maxTimeout > 0) {
            timeout = Math.min(timeout, maxTimeout);
        }

        const controller = new AbortController();
        const onAbort = function (this: AbortSignal, _: Event) {
            controller.abort(this.reason);
            return;
        };
        ctx.signal.addEventListener("abort", onAbort, { once: true });
        const signal = controller.signal;
        const listener = () => {
            ctx.result.stop();
            ctx.result.cancel();
            let reason = "Task was cancelled";
            if (signal.reason instanceof Error) {
                reason = signal.reason.message;
            } else if (typeof signal.reason === "string") {
                reason = signal.reason;
            }
            ctx.bus.send(new TaskCancelled(ctx.state, reason));
        };

        signal.addEventListener("abort", listener, { once: true });
        let handle: number | undefined;
        if (timeout > 0) {
            handle = setTimeout(() => {
                const e = new TimeoutError(`Task ${state.id} timed out after ${timeout}ms`);
                e.timeout = timeout;
                controller.abort(e);
            }, timeout);
        }

        try {
            ctx.result.start();
            if (signal.aborted) {
                ctx.result.stop();
                ctx.result.cancel();
                let reason = "Task was cancelled";
                if (signal.reason instanceof Error) {
                    reason = signal.reason.message;
                } else if (typeof signal.reason === "string") {
                    reason = signal.reason;
                }

                ctx.bus.send(new TaskCancelled(ctx.state, reason));
                return;
            }

            ctx.bus.send(new TaskStarted(ctx.state));

            const c: TaskContext = {
                ...ctx,
                signal,
            };

            const result = await descriptor.run(c);
            ctx.result.stop();
            if (result.isError) {
                ctx.result.stop();
                const e = result.unwrapError();
                if (e instanceof AbortError) {
                    ctx.result.cancel();
                    ctx.bus.send(new TaskCancelled(ctx.state, e.message));
                    return;
                }

                if (e instanceof TimeoutError) {
                    ctx.result.cancel();
                    ctx.bus.send(new TaskCancelled(ctx.state, e.message));
                    return;
                }

                ctx.result.fail(e);
                ctx.bus.send(new TaskFailed(ctx.state, result.unwrapError()));
                return;
            }

            if (signal.aborted) {
                ctx.result.cancel();
                ctx.result.stop();
                let reason = "Task was cancelled";
                if (signal.reason instanceof Error) {
                    reason = signal.reason.message;
                } else if (typeof signal.reason === "string") {
                    reason = signal.reason;
                }

                ctx.bus.send(new TaskCancelled(ctx.state, reason));
                return;
            }

            ctx.result.success();
            ctx.result.outputs = result.unwrap();
            ctx.bus.send(new TaskCompleted(ctx.state, ctx.result));
        } finally {
            if (handle) {
                clearTimeout(handle);
            }

            signal.removeEventListener("abort", listener);
            ctx.signal.removeEventListener("abort", onAbort);
        }

        await next();
    }
}

/**
 * Middleware that executes multiple tasks in sequence.
 */
export class SequentialTaskExecution extends TasksPipelineMiddleware {
    override async run(ctx: TasksPipelineContext, next: Next): Promise<void> {
        const { tasks } = ctx;
        const targets = ctx.targets;

        ctx.writer.debug(`task targets: ${targets.join(", ")}`);
        const cyclesRes = tasks.findCyclycalReferences();
        if (cyclesRes.length > 0) {
            ctx.bus.send(new CyclicalTaskReferences(cyclesRes));
            ctx.status = "failure";
            ctx.error = new Error(
                `Cyclical task references found: ${cyclesRes.map((o) => o.id).join(", ")}`,
            );
        }

        const missingDeps = tasks.missingDependencies();
        if (missingDeps.length > 0) {
            ctx.bus.send(new MissingTaskDependencies(missingDeps));
            ctx.status = "failure";
            ctx.error = new Error("Tasks are missing dependencies");
        }

        const targetTasks: Task[] = [];
        for (const target of targets) {
            const task = tasks.get(target);
            if (task) {
                targetTasks.push(task);
            } else {
                ctx.status = "failure";
                ctx.error = new Error(`Task not found: ${target}`);
                return;
            }
        }

        const flattenedResult = tasks.flatten(targetTasks);
        if (flattenedResult.isError) {
            ctx.status = "failure";
            ctx.error = flattenedResult.unwrapError();
            return;
        }

        const taskSet = flattenedResult.unwrap();

        for (const task of taskSet) {
            const result = new TaskResult(task.id);

            if (ctx.status === "failure" || ctx.status === "cancelled") {
                if (task.force === undefined || task.force === false) {
                    result.skip();
                    ctx.results.push(result);
                    continue;
                }
            }

            const bus = ctx.bus;
            const envData = new StringMap();
            envData.merge(ctx.env);
            const outputs = new Outputs();
            outputs.merge(ctx.outputs);

            const nextContext: TaskPipelineContext = {
                bus: bus,
                cwd: ctx.cwd,
                env: new StringMap().merge(envData),
                outputs,
                registry: ctx.registry,
                secrets: new StringMap().merge(ctx.secrets),
                signal: ctx.signal,
                services: ctx.services,
                variables: ctx.variables,
                result,
                task,
                status: "success",
                writer: ctx.writer,
                environmentName: ctx.environmentName,
                args: ctx.args,
                state: {
                    id: task.id,
                    uses: task.uses,
                    name: task.name ?? task.id,
                    description: task.description ?? "",
                    inputs: new Inputs(),
                    outputs: new Outputs(),
                    force: false,
                    timeout: 0,
                    if: true,
                    env: new StringMap(),
                    envKeys: [],
                    cwd: ctx.cwd,
                    needs: task.needs ?? [],
                },
            };

            const taskPipeline = ctx.services.get("TaskPipeline") as TaskPipeline;
            if (!taskPipeline) {
                ctx.error = new Error(`Service not found: task-pipeline`);
                ctx.bus.error(ctx.error);
                ctx.status = "failure";
                return;
            }

            const r = await taskPipeline.run(nextContext);

            const normalized = underscore(task.id.replace(/:/g, "_"));
            ctx.outputs.set(`task.${normalized}`, r.outputs);
            ctx.outputs.set(normalized, r.outputs);

            for (const [key, value] of nextContext.secrets) {
                if (ctx.secrets.has(key)) {
                    const old = ctx.secrets.get(key);
                    if (old !== value) {
                        ctx.writer.debug(`Secret ${key} has changed in task ${task.id}`);
                        ctx.secrets.set(key, value);
                        ctx.writer.secretMasker.add(value);
                        const envName = underscore(key, { screaming: true });
                        ctx.env.set(envName, value);
                        setPipelineVar(envName, value, { secret: true });
                    }
                } else {
                    ctx.writer.debug(`Secret ${key} was added in task ${task.id}`);
                    ctx.secrets.set(key, value);
                    ctx.writer.secretMasker.add(value);
                    const envName = underscore(key, { screaming: true });
                    ctx.env.set(envName, value);
                    setPipelineVar(envName, value, { secret: true });
                }
            }

            for (const [key, value] of nextContext.env) {
                if (ctx.env.has(key)) {
                    const old = ctx.env.get(key);
                    if (old !== value) {
                        ctx.writer.debug(`Env ${key} has changed in task ${task.id}`);
                        ctx.env.set(key, value);
                        setPipelineVar(key, value);
                    }
                } else {
                    ctx.writer.debug(`Env ${key} has changed in task ${task.id}`);
                    ctx.env.set(key, value);
                    setPipelineVar(key, value);
                }
            }

            ctx.results.push(r);
            if (ctx.status !== "failure") {
                if (r.status === "failure") {
                    ctx.status = "failure";
                    ctx.error = r.error;

                    break;
                }

                if (r.status === "cancelled") {
                    ctx.status = "cancelled";
                    break;
                }
            }
        }

        await next();
    }
}
