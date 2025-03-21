import { Command } from "@cliffy/command";
import { keypress, type KeyPressEvent } from "@cliffy/keypress";
import { Runner, type RunnerOptions } from "@rex/pipelines/runner";
import { VERSION } from "../version.ts";
import { getDeployments } from "../discovery.ts";
import { logLevels, parseLogLevel } from "./types.ts";

export const rollbackCommand = new Command()
    .name("rex-rollback")
    .description(
        "Rollback a single deployoment from a rexfile.",
    )
    .version(VERSION)
    .type("loglevel", logLevels)
    .arguments("[target:string[]:rollback] [...args]")
    .complete("deployments", async () => {
        return await getDeployments();
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
    .option("--env-file, -ef <env-file:file>", "Sets an environment variable from a file", {
        collect: true,
    })
    .stopEarly()
    .action(async ({ file, logLevel, timeout, context, env, envFile }, targets, ...args) => {
        const runner = new Runner();
        const controller = new AbortController();
        const kp = keypress();
        kp.addEventListener("keydown", (event: KeyPressEvent) => {
            if (event.ctrlKey && event.key === "c") {
                controller.abort();
                kp.dispose();
            }
        });
        const options: RunnerOptions = {
            file: file,
            targets: targets ?? ["default"],
            command: "rollback",
            timeout: timeout,
            logLevel: parseLogLevel(logLevel),
            context: context,
            env: env,
            envFile: envFile,
            signal: controller.signal,
            args,
        };
        await runner.run(options);
    });
