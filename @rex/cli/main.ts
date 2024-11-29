/**
 * # @rex/cli
 *
 * The rex cli task, job, and deployment runner.  The cli
 * executes rexfiles.ts
 *
 * ## Documentation
 *
 * Documentation is available on [jsr.io](https://jsr.io/@rex/cli/doc)
 *
 * ## Usage
 *
 * ```bash
 * deno install --global -A -n rex jsr:@rex/cli@0.0.0-alpha.0
 * rex -h
 * # runs the default task
 * rex task default
 *
 * # runs a job called build with the debug log level
 * rex job build --log-level debug
 *
 * # runs a deploy job with the context
 * ```
 *
 * ## Rexfile
 *
 * ```ts
 * import { WINDOWS } from "@bearz/runtime-info/os";
 * import { cmd, job, scriptTask, task, deploy } from "@rex/rexfile";
 *
 * task("test", _ => console.log("Hello, world!"));
 *
 * // a tasks to dependents on other tasks
 * // the other tasks will run before this task.
 * task("default", ["test"], async _ => {
 *     await cmd("echo", ["Hello, world!"]).run();
 * })
 * // only run on non-windows
 * .if(_ => !WINDOWS);
 *
 * scriptTask("test:bash", "bash", "echo 'Hello, world!' \n ls -la");
 *
 * task("secrets", (ctx) => {
 *     ctx.secrets.set("secret", "super secret");
 * });
 *
 * task("print:secrets", ["secrets"], (ctx) => {
 *     console.log(ctx.secrets.get("secret"));
 *     console.log(ctx.env.get("SECRET"));
 *     ctx.writer.maskLine("My secret is super secret");
 *
 *     for(const [key, value] of ctx.secrets) {
 *         console.log(`${key}=${value}`);
 *     }
 * });
 *
 * task("print:env", (ctx) => {
 *     for (const [key, value] of ctx.env) {
 *         console.log(`${key}=${value}`);
 *     }
 * })
 * .description("Prints the environment variables");
 *
 * // a job is a collection of tasks that are
 * // executed in order of declaration
 * job("build").tasks((map, add) => {
 *     // adds a top level task to the job. enables reuse.
 *     add("test");
 *
 *     // adds a task that is unique to the job.
 *     // this is added to the job's task map.
 *     task("test:2", () => console.log("test 2"), map).if((_) => WINDOWS);
 * });
 *
 * // deploy is a special task/job hybrid where
 * // the deploy delegate is the primary task.
 * // before and after are events that will run
 * // one or more tasks in sequential order, similar
 * // to job.
 *
 * // the delegate deploy tasks has a 'before:delpoy'
 * // and 'after:deploy' event.
 * // other deploy implementations can implement additional
 * // custom events that run other sets of tasks.
 *
 * deploy("deploy", (ctx) => {
 *     console.log("deploying..");
 *     console.log(ctx.writer.level);
 *     console.log(ctx.environmentName); // this is set with the --context param in the cli
 *     ctx.writer.warn("Deploying to the moon");
 *     ctx.writer.error("Deploying to the moon");
 *     ctx.writer.debug("Deploying to the moon");
 *     ctx.writer.info("Deploying to the moon");
 * })
 * .before((map) => {
 *     task("before:deploy", (ctx) =>  {
 *         console.log("before deploy")
 *         console.log(ctx.env.get("REX_ENVIRONMENT")); // this the --context param in the cli
 *     }, map);
 * })
 * .after((map) => {
 *     task("after:deploy", () => console.log("after deploy"), map);
 * });
 * ```
 *
 * ## License
 *
 * [MIT License](./LICENSE.md)
 * @module
 */
import { Command } from "@cliffy/command";
import { CompletionsCommand } from "@cliffy/command/completions";
import { taskCommand } from "./cmds/task.ts";
import { jobCommand } from "./cmds/job.ts";
import { deployCommand } from "./cmds/deploy.ts";
import { listCommand } from "./cmds/list.ts";
import { VERSION } from "./version.ts";
import { Runner, type RunnerOptions } from "@rex/pipelines/runner";
import { getAll } from "./discovery.ts";
import { keypress, type KeyPressEvent } from "@cliffy/keypress";

const app = new Command()
    .name("rex")
    .description(
        `Rex is a developer's sidekick. It helps you automate tasks and manage your project.

Rex can run tasks, jobs, and deployments from a rexfile.ts. Tasks are a unit of work and can
depend on other tasks. Jobs are a collection of tasks that run in order. Deployments are a
special type of job that has has before and after tasks and the primary task is the deployment.
        `,
    )
    .version(VERSION)
    .arguments("[target:string[]:targets]")
    .complete("targets", async () => {
        return await getAll();
    })
    .option("-f, --file <file:string>", "The rexfile to run")
    .option("--log-level <log-level:string>", "Enable debug mode", { default: "info" })
    .option("-t, --timeout <timeout:number>", "Set the timeout in minutes.")
    .option(
        "-c --context <context:string>",
        "The context (environment) name. Defaults to 'local'",
        { default: "local" },
    )
    .option("-e --env <env:string>", "Sets an environment variable", { collect: true })
    .option("--env-file <env-file:string>", "Sets an environment variable from a file", {
        collect: true,
    })
    .action(async ({ file, logLevel, timeout, env, envFile, context }, targets) => {
        const runner = new Runner();
        const controller = new AbortController();
        keypress().addEventListener("keydown", (event: KeyPressEvent) => {
            if (event.ctrlKey && event.key === "c") {
                controller.abort();
                keypress().dispose();
            }
        });

        const options: RunnerOptions = {
            file: file,
            targets: targets ?? ["default"],
            command: "run",
            timeout: timeout,
            logLevel: logLevel,
            env: env,
            envFile: envFile,
            context: context,
            signal: controller.signal,
        };
        await runner.run(options);
    })
    .command("task", taskCommand)
    .command("job", jobCommand)
    .command("list", listCommand)
    .command("deploy", deployCommand)
    .command("completion", new CompletionsCommand());

if (import.meta.main) {
    await app.parse(Deno.args);
}
