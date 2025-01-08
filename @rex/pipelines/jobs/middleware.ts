import type { Next } from "../pipeline.ts";
import type { SequentialTasksPipeline, TasksPipelineContext } from "../tasks/pipelines.ts";
import {
    CyclicalJobReferences,
    JobCancelled,
    JobCompleted,
    JobFailed,
    JobSkipped,
    JobStarted,
    MissingJobDependencies,
} from "./messages.ts";
import {
    type JobPipeline,
    type JobPipelineContext,
    JobPipelineMiddleware,
    type JobsPipelineContext,
    JobsPipelineMiddleware,
} from "./pipelines.ts";
import { rexTaskHandlerRegistry, TaskMap } from "@rex/tasks";
import { type Job, JobResult } from "@rex/jobs";
import { Inputs, Outputs, StringMap } from "@rex/primitives";
import { underscore } from "@bearz/strings/underscore";
import { TimeoutError } from "@bearz/errors";

/**
 * Middleware that applies a job to the context by resolving the job's properties
 * into values that can be used to execute the job
 */
export class ApplyJobContext extends JobPipelineMiddleware {
    override async run(ctx: JobPipelineContext, next: Next): Promise<void> {
        const meta = ctx.state;
        const task = ctx.job;

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

            await next();
        } catch (e) {
            ctx.result.stop();
            if (!(e instanceof Error)) {
                const e2 = new Error(`Unknown error: ${e}`);
                ctx.result.fail(e2);
                ctx.bus.send(new JobFailed(meta, e2));
                return;
            }
            ctx.result.fail(e);
            ctx.bus.send(new JobFailed(meta, e));

            return;
        }
    }
}

/**
 * Middleware that runs a job by executing the tasks in the job
 */
export class RunJob extends JobPipelineMiddleware {
    override async run(ctx: JobPipelineContext, next: Next): Promise<void> {
        const { state } = ctx;

        if (ctx.signal.aborted) {
            ctx.result.cancel();
            ctx.result.stop();
            ctx.bus.send(new JobCancelled(ctx.state));
            return;
        }

        if (ctx.status === "failure" || ctx.status === "cancelled" && !state.force) {
            ctx.result.skip();
            ctx.result.stop();
            ctx.bus.send(new JobSkipped(ctx.state));
            return;
        }

        if (state.if === false) {
            ctx.result.skip();
            ctx.result.stop();
            ctx.bus.send(new JobSkipped(ctx.state));
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
        const onAbort = function (this: AbortSignal) {
            controller.abort(this.reason);
        };

        ctx.signal.addEventListener("abort", onAbort, { once: true });
        const signal = controller.signal;
        const listener = () => {
            ctx.result.cancel();
            ctx.result.stop();
            ctx.bus.send(new JobCancelled(ctx.state));
        };

        signal.addEventListener("abort", listener, { once: true });
        const handle = setTimeout(() => {
            const e = new TimeoutError(`Job ${state.id} timed out after ${timeout}ms`);
            e.timeout = timeout;
            controller.abort(e);
        }, timeout);

        try {
            ctx.result.start();

            if (signal.aborted) {
                ctx.result.cancel();
                ctx.result.stop();
                ctx.bus.send(new JobCancelled(ctx.state));
                return;
            }

            ctx.bus.send(new JobStarted(ctx.state));

            const tasksPipeline = ctx.services.get(
                "SequentialTasksPipeline",
            ) as SequentialTasksPipeline;
            if (!tasksPipeline) {
                throw new Error(`Service 'tasks-pipeline' not found.`);
            }

            const tasks = new TaskMap();
            for (const task of ctx.job.tasks) {
                tasks.set(task.id, task);
            }

            const targets = ctx.job.tasks.map((t) => t.id);

            const tasksCtx: TasksPipelineContext = Object.assign({}, ctx, {
                targets: targets,
                tasks: tasks,
                registry: rexTaskHandlerRegistry(),
                results: [],
                status: "success",
                signal: signal,
                bus: ctx.bus,
            }) as TasksPipelineContext;

            const summary = await tasksPipeline.run(tasksCtx);
            ctx.result.stop();
            if (summary.error) {
                ctx.result.fail(summary.error);
                ctx.bus.send(new JobFailed(ctx.state, summary.error));
                return;
            }
            const normalized = underscore(ctx.job.id.replace(/:/g, "_"));
            // only outputs are synced between jobs
            for (const [key, value] of tasksCtx.outputs) {
                if (key.startsWith("tasks.")) {
                    ctx.outputs.set(`jobs.${normalized}.${key}`, value);
                }
            }

            ctx.result.success();
            ctx.bus.send(new JobCompleted(ctx.state, ctx.result));
        } finally {
            clearTimeout(handle);
            signal.removeEventListener("abort", listener);
            ctx.signal.removeEventListener("abort", onAbort);
        }

        await next();
    }
}

/**
 * Middleware that executes multiple jobs in sequence.
 */
export class JobsExcution extends JobsPipelineMiddleware {
    override async run(ctx: JobsPipelineContext, next: Next): Promise<void> {
        const jobs = ctx.jobs;
        const targets = ctx.targets;

        const cyclesRes = jobs.findCyclycalReferences();
        if (cyclesRes.length > 0) {
            ctx.status = "failure";
            ctx.error = new Error(
                `Cyclical job references found: ${cyclesRes.map((o) => o.id).join(", ")}`,
            );

            ctx.bus.send(new CyclicalJobReferences(cyclesRes));
            return;
        }

        const missingDeps = jobs.missingDependencies();
        if (missingDeps.length > 0) {
            ctx.bus.send(new MissingJobDependencies(missingDeps));
            ctx.status = "failure";
            ctx.error = new Error("Jobs are missing dependencies");
            return;
        }

        const targetJobs: Job[] = [];
        for (const target of targets) {
            const job = jobs.get(target);
            if (job) {
                targetJobs.push(job);
            } else {
                ctx.status = "failure";
                ctx.error = new Error(`Task not found: ${target}`);
                return;
            }
        }

        const flattenedResult = jobs.flatten(targetJobs);
        if (flattenedResult.isError) {
            ctx.status = "failure";
            ctx.error = flattenedResult.unwrapError();
            return;
        }

        const jobSet = flattenedResult.unwrap();
        const outputs = new Outputs().merge(ctx.outputs);

        for (const job of jobSet) {
            const bus = ctx.bus;
            const result = new JobResult(job.id);

            const jobPipeline = ctx.services.get("JobPipeline") as JobPipeline;
            if (!jobPipeline) {
                ctx.error = new Error(`Service not found: job-pipeline`);
                ctx.bus.error(ctx.error);
                ctx.status = "failure";
                return;
            }

            const nextContext: JobPipelineContext = {
                bus: bus,
                cwd: ctx.cwd,
                env: new StringMap().merge(ctx.env),
                registry: ctx.registry,
                secrets: new StringMap().merge(ctx.secrets),
                signal: ctx.signal,
                services: ctx.services,
                variables: ctx.variables,
                environmentName: ctx.environmentName,
                outputs: new Outputs().merge(ctx.outputs),
                result,
                job,
                status: "success",
                writer: ctx.writer,
                args: ctx.args,
                state: {
                    id: job.id,
                    name: job.name ?? job.id,
                    description: job.description ?? "",
                    inputs: new Inputs(),
                    outputs: new Outputs(),
                    force: false,
                    timeout: 0,
                    tasks: job.tasks,
                    if: true,
                    env: new StringMap(),
                    envKeys: [],
                    cwd: ctx.cwd,
                    needs: job.needs ?? [],
                },
            };

            const r = await jobPipeline.run(nextContext);
            // only outputs are synced between jobs
            for (const [key, value] of nextContext.outputs) {
                if (key.startsWith("jobs.")) {
                    if (!ctx.outputs.has(key)) {
                        outputs.set(key, value);
                    }
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
