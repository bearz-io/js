import { Command } from "@cliffy/command";
import { Runner, type RunnerOptions } from "@rex/pipelines/runner";
import { VERSION } from "../version.ts";
import { getTasks } from "../discovery.ts";
import { keypress, type KeyPressEvent } from "@cliffy/keypress";
import { logLevels, parseLogLevel } from "./types.ts";

export const taskCommand = new Command()
    .name("rex-task")
    .description(
        "Runs one or more tasks from a rexfile.",
    )
    .type("loglevel", logLevels)
    .version(VERSION)
    .option("-f, --file <file:file>", "The rexfile to run")
    .option("-v --log-level <log-level:loglevel>", "Enable debug mode", { default: "info" })
    .option("-t, --timeout <timeout:number>", "Set the timeout for the task in minutes.")
    .complete("names", async () => {
        const tasks = await getTasks();
        return tasks;
    })
    .option(
        "-c --context <context:string>",
        "The context (environment) name. Defaults to 'local'",
        { default: "local" },
    )
    .option("-e --env <env:string>", "Sets an environment variable", { collect: true })
    .option("--env-file, --ef <env-file:file>", "Sets an environment variable from a file", {
        collect: true,
    })
    .arguments("[target:string[]:names] [...args]")
    .stopEarly()
    .action(
        async (
            { file, logLevel, timeout, env, envFile, context },
            targets,
            ...args: Array<string>
        ) => {
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
                command: "task",
                timeout: timeout,
                logLevel: parseLogLevel(logLevel),
                env: env,
                envFile: envFile,
                context: context,
                signal: controller.signal,
                args: args,
            };
            await runner.run(options);
        },
    );
