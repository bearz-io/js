import { Command } from "@cliffy/command";
import { Runner, type RunnerOptions } from "@rex/pipelines/runner";
import { VERSION } from "../version.ts";
import { getJobs } from "../discovery.ts";
import { keypress, type KeyPressEvent } from "@cliffy/keypress";
import { logLevels, parseLogLevel } from "./types.ts";

/**
 * The job command.
 */
export const jobCommand = new Command()
    .name("rex-job")
    .description(
        "Run one or more jobs from a rexfile. Jobs are a group of tasks executed in order.",
    )
    .version(VERSION)
    .type("loglevel", logLevels)
    .arguments("[target:string[]:jobs] [...args]")
    .complete("jobs", async () => {
        return await getJobs();
    })
    .option("-f, --file <file:file>", "The rexfile to run")
    .option("-v --log-level <log-level:loglevel>", "Enable debug mode", { default: "info" })
    .option("-t, --timeout <timeout:number>", "Set the timeout for the job")
    .option(
        "-c --context <context:string>",
        "The context (environment) name. Defaults to 'default'",
        { default: "default" },
    )
    .option("-e --env <env:string>", "Sets an environment variable", { collect: true })
    .option("--env-file, --ef <env-file:file>", "Sets an environment variable from a file", {
        collect: true,
    })
    .stopEarly()
    .action(async ({ file, logLevel, timeout, env, envFile, context }, targets, ...args) => {
        const runner = new Runner();
        const controller = new AbortController();
        keypress().addEventListener("keydown", (event: KeyPressEvent) => {
            if (event.ctrlKey && event.key === "c") {
                controller.abort("Cancelled by user.");
                keypress().dispose();
            }
        });

        const options: RunnerOptions = {
            file: file,
            targets: targets ?? ["default"],
            command: "job",
            timeout: timeout,
            logLevel: parseLogLevel(logLevel),
            env: env,
            envFile: envFile,
            context: context,
            signal: controller.signal,
            args: args,
        };
        await runner.run(options);
    });
