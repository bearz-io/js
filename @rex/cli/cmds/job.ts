import { Command } from "@cliffy/command";
import { Runner, type RunnerOptions } from "@rex/pipelines/runner";
import { VERSION } from "../version.ts";
import { getJobs } from "../discovery.ts";
import { keypress, type KeyPressEvent } from "@cliffy/keypress";

export const jobCommand = new Command()
    .name("rex-job")
    .description(
        "Run one or more jobs from a rexfile. Jobs are a group of tasks executed in order.",
    )
    .version(VERSION)
    .arguments("[target:string[]:jobs]")
    .complete("jobs", async () => {
        return await getJobs();
    })
    .option("-f, --file <file:string>", "The rexfile to run")
    .option("--log-level <log-level:string>", "Enable debug mode", { default: "info" })
    .option("-t, --timeout <timeout:number>", "Set the timeout for the job")
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
            command: "job",
            timeout: timeout,
            logLevel: logLevel,
            env: env,
            envFile: envFile,
            context: context,
            signal: controller.signal,
        };
        await runner.run(options);
    });
