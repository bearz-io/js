import { chdir, cwd as getCwd, exit } from "@bearz/process";
import { dirname, isAbsolute, join, resolve } from "@std/path";
import { writer } from "./ci/writer.ts";
import {
    type ExecutionContext,
    Inputs,
    LogLevel,
    ObjectMap,
    Outputs,
    StringMap,
} from "@rex/primitives";
import { DefaultLoggingMessageBus } from "./bus.ts";
import { handleTaskMessages } from "./tasks/console_sink.ts";
import { handleJobMessages } from "./jobs/console_sink.ts";
import { handleDeploymentMessages } from "./deployments/console_sink.ts";
import {
    SequentialTasksPipeline,
    TaskPipeline,
    type TasksPipelineContext,
} from "./tasks/pipelines.ts";
import { env } from "@bearz/env";
import { DiscoveryPipeline, type DiscoveryPipelineContext } from "./discovery/pipelines.ts";
import { rexTaskHandlerRegistry, TaskMap } from "@rex/tasks";
import { JobMap } from "@rex/jobs";
import { DeploymentMap, DeploymentResult, rexDeploymentHandlerRegistry } from "@rex/deployments";
import { RexfileDiscovery } from "./discovery/middlewares.ts";
import { ApplyTaskContext, SequentialTaskExecution, TaskExecution } from "./tasks/middlewares.ts";
import { type JobsPipelineContext, SequentialJobsPipeline } from "./jobs/mod.ts";
import { ApplyJobContext, JobsExcution, RunJob } from "./jobs/middleware.ts";
import { JobPipeline } from "./jobs/pipelines.ts";
import { DeploymentPipeline, type DeploymentPipelineContext } from "./deployments/pipelines.ts";
import { parse } from "@bearz/dotenv";
import { load } from "@bearz/dotenv/load";
import { readTextFile } from "@bearz/fs";
import { ApplyDeploymentContext, RunDeployment } from "./deployments/middleware.ts";
import { TimeoutError } from "../../@bearz/errors/timeout_error.ts";

/**
 * The options for the runner.
 */
export interface RunnerOptions {
    /**
     * The rexfile to run.
     */
    file?: string;
    /**
     * The current working directory.
     */
    cwd?: string;
    /**
     * The command to run.
     */
    command?: string;
    /**
     * The targets to run.
     */
    targets?: string[];
    /**
     * The timeout for the runner.
     */
    timeout?: number;
    /**
     * The log level for the runner.
     */
    logLevel?: LogLevel;
    /**
     * The context for the runner which is mapped to the environmentName.
     */
    context?: string;

    /**
     * Additional environment variables to set.
     */
    env?: string[];
    /**
     * Dotenv files to load.
     */
    envFile?: string[];
    /**
     * The signal to abort the runner.
     */
    signal?: AbortSignal;
    /**
     * Additional arguments to pass to the tasks, jobs, or deployments.
     */
    args?: string[];
}

/**
 * The runner for the rex tasks, jobs, and deployments.
 */
export class Runner {
    /**
     * Creates a new Runner.
     */
    constructor() {
    }

    /**
     * Runs the specified options.
     * @param options The options to run.
     */
    async run(options: RunnerOptions) {
        let { file, cwd, command, targets, timeout, logLevel } = options;

        writer.setLogLevel(logLevel ?? LogLevel.Info);

        writer.debug(`log level: ${writer.level}`);
        writer.trace(`log level: ${writer.level}`);
        writer.trace(`file: ${file}`);
        writer.trace(`command: ${command}`);

        cwd ??= getCwd();

        if (file) {
            if (!isAbsolute(file)) {
                file = resolve(file);
            }

            const dir = dirname(file);
            if (dir) {
                cwd = dir;
                chdir(cwd);
            }
        }

        if (options.envFile) {
            for (const file of options.envFile) {
                const content = await readTextFile(file);
                const records = parse(content);
                load(records);
            }
        }

        if (options.env) {
            for (const e of options.env) {
                const [key, value] = e.split("=");
                if (value.startsWith("'")) {
                    env.set(key, value.slice(1, value.length - 1));
                } else if (value.startsWith('"')) {
                    env.set(key, value.slice(1, value.length - 1));
                } else {
                    env.set(key, value);
                }
            }
        }

        writer.trace(`CWD: ${cwd}`);

        file ??= join(cwd, "rexfile.ts");
        writer.trace(`Rexfile: ${file}`);

        timeout ??= 60 * 60;
        if (timeout < 1) {
            timeout = 60 * 3;
        }

        const controller = new AbortController();

        if (options.signal) {
            options.signal.addEventListener("abort", () => {
                controller.abort();
            }, { once: true });
        }

        let handle = -1;

        if (timeout > 0) {
            handle = setTimeout(() => {
                const e = new TimeoutError(`Max timeout of ${timeout} seconds exceeded.`);
                e.timeout = timeout;
                controller.abort(e);
            }, timeout * 1000);
        }

        const signal = controller.signal;

        try {
            signal.addEventListener("abort", () => {
                writer.error(`Timeout of ${timeout} seconds exceeded.`);
                exit(1);
            }, { once: true });

            command ??= "run";
            targets ??= ["default"];

            const bus = new DefaultLoggingMessageBus();
            bus.addListener(handleTaskMessages);
            bus.addListener(handleJobMessages);
            bus.addListener(handleDeploymentMessages);

            const ctx: ExecutionContext = {
                services: new ObjectMap(),
                secrets: new StringMap(),
                variables: new ObjectMap(),
                env: new StringMap(),
                cwd: cwd,
                outputs: new Outputs(),
                writer: writer,
                bus: bus,
                signal: signal,
                environmentName: options.context ?? "local",
                args: options.args ?? [],
            };

            ctx.env.set("REX_ENVIRONMENT", options.context ?? "local");
            ctx.env.set("REX_CONTEXT", options.context ?? "local");

            const discoveryPipeline = new DiscoveryPipeline();
            discoveryPipeline.use(new RexfileDiscovery());
            const taskPipeline = new TaskPipeline();
            // first will execute the last.
            taskPipeline.use(new TaskExecution());
            taskPipeline.use(new ApplyTaskContext());

            const tasksPipeline = new SequentialTasksPipeline();
            tasksPipeline.use(new SequentialTaskExecution());

            const jobsPipeline = new SequentialJobsPipeline();
            jobsPipeline.use(new JobsExcution());

            const jobPipeline = new JobPipeline();
            jobPipeline.use(new RunJob());
            jobPipeline.use(new ApplyJobContext());

            const deploymentPipeline = new DeploymentPipeline();
            deploymentPipeline.use(new RunDeployment());
            deploymentPipeline.use(new ApplyDeploymentContext());

            ctx.services.set("TasksPipeline", tasksPipeline);
            ctx.services.set("SequentialTasksPipeline", tasksPipeline);
            ctx.services.set("TaskPipeline", taskPipeline);
            ctx.services.set("JobsPipeline", jobsPipeline);
            ctx.services.set("SequentialJobsPipeline", jobsPipeline);
            ctx.services.set("JobPipeline", jobPipeline);
            ctx.services.set("DeploymentPipeline", deploymentPipeline);
            ctx.services.set("timeout", timeout);

            for (const [key, value] of Object.entries(env.toObject())) {
                if (value !== undefined) {
                    ctx.env.set(key, value);
                }
            }

            const discoveryContext: DiscoveryPipelineContext = Object.assign({}, ctx, {
                file: file,
                cwd: cwd,
                tasks: new TaskMap(),
                jobs: new JobMap(),
                deployments: new DeploymentMap(),
                bus: bus,
            });

            writer.trace("Running discovery pipeline");
            const res = await discoveryPipeline.run(discoveryContext);
            writer.trace(`Rexfile ${res.file} discovered`);
            if (res.error) {
                writer.error(res.error);
                exit(1);
            }

            if (res.tasks.size === 0 && res.jobs.size === 0 && res.deployments.size === 0) {
                writer.error("No tasks, jobs, or deployments found.");
                exit(1);
            }

            if (!command || command === "run") {
                if (targets.length > 0) {
                    if (res.tasks.has(targets[0])) {
                        command = "task";
                    }

                    if (res.jobs.has(targets[0])) {
                        if (command !== "run") {
                            writer.error(
                                "Tasks, jobs, and/or deployments have a target named `${targets[0]}`.  Please specify use the task, job, or deploy subcomands.",
                            );
                            exit(1);
                        } else {
                            command = "job";
                        }
                    }

                    if (res.deployments.has(targets[0])) {
                        if (command !== "run") {
                            writer.error(
                                "Tasks, jobs, and/or deployments have a target named `${targets[0]}`.  Please specify use the task, job, or deploy subcomands.",
                            );
                            exit(1);
                        } else {
                            command = "deploy";
                        }
                    }
                }
            }

            switch (command) {
                case "task":
                case "run":
                    {
                        const tasksCtx: TasksPipelineContext = Object.assign({}, ctx, {
                            targets: targets,
                            tasks: res.tasks,
                            registry: rexTaskHandlerRegistry(),
                            results: [],
                            status: "success",
                            bus: bus,
                            environmentName: options.context ?? "local",
                            args: options.args ?? [],
                        }) as TasksPipelineContext;

                        const results = await tasksPipeline.run(
                            tasksCtx as unknown as TasksPipelineContext,
                        );
                        if (results.error) {
                            writer.error(results.error);
                            exit(1);
                        }

                        if (results.status === "failure") {
                            writer.error("Pipeline failed");
                            exit(1);
                        }
                        exit(0);
                    }

                    break;
                case "job":
                    {
                        const jobsCtx: JobsPipelineContext = Object.assign({}, ctx, {
                            targets: targets,
                            tasks: res.tasks,
                            registry: rexTaskHandlerRegistry(),
                            results: [],
                            status: "success",
                            bus: bus,
                            jobs: res.jobs,
                            environmentName: options.context ?? "local",
                            args: options.args ?? [],
                        }) as JobsPipelineContext;

                        const results = await jobsPipeline.run(jobsCtx);
                        if (results.error) {
                            writer.error(results.error);
                            exit(1);
                        }

                        if (results.status === "failure") {
                            writer.error("Pipeline failed");
                            exit(1);
                        }
                        exit(0);
                    }
                    break;
                case "list":
                    if (res.tasks.size) {
                        writer.writeLine("TASKS:");
                    }

                    for (const [key, _] of res.tasks.entries()) {
                        writer.writeLine(`  ${key}  ${_.description ?? ""}`);
                    }

                    if (res.jobs.size) {
                        writer.writeLine("");
                        writer.writeLine("JOBS:");
                    }

                    for (const [key, _] of res.jobs.entries()) {
                        writer.writeLine(`  ${key}  ${_.description ?? ""}`);
                    }

                    if (res.deployments.size) {
                        writer.writeLine("");
                        writer.writeLine("DEPLOYMENTS:");
                    }

                    for (const [key, _] of res.deployments.entries()) {
                        writer.writeLine(`  ${key}  ${_.description ?? ""}`);
                    }
                    break;
                case "rollback":
                case "destroy":
                case "deploy":
                    {
                        if (targets.length > 1) {
                            writer.error("Deploy command does not support multiple targets yet.");
                            exit(1);
                        }

                        const deployment = res.deployments.get(targets[0]);
                        if (!deployment) {
                            writer.error(`Deployment ${targets[0]} not found`);
                            exit(1);
                            return;
                        }

                        const needs = deployment.needs ?? [];
                        if (needs.length > 0) {
                            writer.warn(`Deployment needs are are not supported yet`);
                        }

                        const deploymentsCtx: DeploymentPipelineContext = {
                            deployment,
                            tasksRegistry: rexTaskHandlerRegistry(),
                            bus,
                            writer,
                            directive: command as "deploy" | "rollback" | "destroy",
                            status: "success",
                            variables: new ObjectMap(),
                            services: ctx.services,
                            cwd: ctx.cwd,
                            deploymentsRegistry: rexDeploymentHandlerRegistry(),
                            outputs: ctx.outputs,
                            secrets: ctx.secrets,
                            env: ctx.env,
                            environmentName: options.context ?? "local",
                            signal: ctx.signal,
                            events: {},
                            result: new DeploymentResult(deployment.id),
                            args: options.args ?? [],
                            state: {
                                status: "success",
                                error: undefined,
                                id: deployment.id,
                                name: deployment.name ?? deployment.id,
                                description: deployment.description ?? "",
                                cwd: ctx.cwd,
                                outputs: new Outputs(),
                                env: new StringMap(),
                                deploy: true,
                                force: false,
                                needs: deployment.needs ?? [],
                                envKeys: [],
                                if: true,
                                timeout: 0,
                                inputs: new Inputs(),
                                uses: deployment.uses,
                            },
                        };

                        const results = await deploymentPipeline.run(deploymentsCtx);
                        if (results.error) {
                            writer.error(results.error);
                            exit(1);
                        }

                        if (results.status === "failure") {
                            writer.error("Pipeline failed");
                            exit(1);
                        }
                        exit(0);
                    }
                    break;

                default:
                    writer.error(`Unknown command: ${command}`);
                    exit(1);
            }
        } catch (error) {
            const e = error as Error;
            writer.error(e);
            exit(1);
        } finally {
            if (handle !== -1) {
                clearTimeout(handle);
            }
        }
    }
}
