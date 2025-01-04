import { JobMap, REX_JOBS } from "@rex/jobs";
import { REX_TASKS, TaskMap, toError } from "@rex/tasks";
import { DeploymentMap, REX_DEPLOYMENTS } from "@rex/deployments";
import type { ExecutionContext } from "@rex/primitives";
import type { Next } from "../pipeline.ts";
import { type DiscoveryPipelineContext, DiscoveryPipelineMiddleware } from "./pipelines.ts";
import { exists, realPath } from "@bearz/fs";
import { isAbsolute, join } from "@std/path";

export interface RexFileImports {
    tasks?: TaskMap;
    setup?: (ctx: ExecutionContext) => Promise<void> | void;
    teardown?: (ctx: ExecutionContext) => Promise<void> | void;
    jobs?: JobMap;
    deployments?: DeploymentMap;
}

export class RexfileDiscovery extends DiscoveryPipelineMiddleware {
    override async run(context: DiscoveryPipelineContext, next: Next): Promise<void> {
        const ctx = context as DiscoveryPipelineContext;
        try {
            const { writer } = ctx;
            writer.trace("Discovering tasks");
            const globalTasks = REX_TASKS;
            const globalJobs = REX_JOBS;
            const globalDeployments = REX_DEPLOYMENTS;
            let file = ctx.file;
            if (file && !file.endsWith(".ts")) {
                ctx.bus.warn(`Tasks file ${ctx.file} must be a typescript file.`);
                return;
            }

            let cwd = ctx.cwd;
            if (cwd.startsWith("http")) {
                const url = new URL(cwd);
                cwd = url.pathname;
                writer.debug(`CWD: ${cwd}`);
            }

            if (file === undefined || file === null || file === "") {
                file = join(cwd, "rexfile.ts");
                writer.trace(`No tasks file specified.  Using ${file}`);
            }
            if (!isAbsolute(file)) {
                console.log("file", file);
                file = await realPath(file);
            }

            if (!await exists(file)) {
                file = join(cwd, ".rex", "tasks.ts");
            }

            if (!await exists(file)) {
                ctx.bus.warn(`No tasks file found at ${file}`);
                return;
            }

            if (!file.startsWith("http")) {
                file = `file://${file}`;
            }

            ctx.file = file;
            const mod = await import(file) as RexFileImports;

            if (!mod.tasks) {
                if (globalTasks.size === 0) {
                    ctx.bus.debug(
                        `No tasks found in ${file}.  Task file must export a variable called tasks is type TaskMap.`,
                    );
                } else {
                    for (const [key, value] of globalTasks.entries()) {
                        ctx.tasks.set(key, value);
                    }
                }
            } else {
                if (!(mod.tasks instanceof TaskMap)) {
                    ctx.bus.error(
                        new Error(`Tasks in ${file} must be of type TaskMap`),
                        "Error collecting tasks",
                    );
                    return;
                }

                for (const [key, value] of mod.tasks.entries()) {
                    ctx.tasks.set(key, value);
                }
            }

            if (!mod.deployments) {
                if (globalDeployments.size === 0) {
                    ctx.bus.debug(
                        `No deployments found in ${file}.  Rexfile file must export a variable called deployments is type DeploymentMap.`,
                    );
                } else {
                    for (const [key, value] of globalDeployments.entries()) {
                        ctx.deployments.set(key, value);
                    }
                }
            } else {
                if (!(mod.deployments instanceof DeploymentMap)) {
                    ctx.bus.error(
                        new Error(`Deployments in ${file} must be of type DeploymentMap`),
                        "Error collecting tasks",
                    );
                    return;
                }

                for (const [key, value] of mod.deployments.entries()) {
                    ctx.deployments.set(key, value);
                }
            }

            if (!mod.jobs) {
                if (globalJobs.size === 0) {
                    ctx.bus.debug(
                        `No jobs found in ${file}.  Rexfile file must export a variable called jobs is type JobMap.`,
                    );
                } else {
                    for (const [key, value] of globalJobs.entries()) {
                        ctx.jobs.set(key, value);
                    }
                }
            } else {
                if (!(mod.jobs instanceof JobMap)) {
                    ctx.bus.error(
                        new Error(`Jobs in ${file} must be of type JobMap`),
                        "Error collecting tasks",
                    );
                    return;
                }

                for (const [key, value] of mod.jobs.entries()) {
                    ctx.jobs.set(key, value);
                }
            }

            if (mod.setup && typeof mod.setup === "function") {
                ctx.setup = mod.setup;
            }

            if (mod.teardown && typeof mod.teardown === "function") {
                ctx.teardown = mod.teardown;
            }

            await next();
        } catch (e) {
            const error = toError(e);
            ctx.error = error;
        }
    }
}
