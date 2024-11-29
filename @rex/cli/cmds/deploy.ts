import { Command } from "@cliffy/command";
import { keypress, type KeyPressEvent } from "@cliffy/keypress";
import { Runner, type RunnerOptions } from "@rex/pipelines/runner";
import { VERSION } from "../version.ts";
import { getDeployments } from "../discovery.ts";

export const deployCommand = new Command()
    .name("rex-deploy")
    .description(
        "Runs a single deployment from a rexfile.",
    )
    .version(VERSION)
    .arguments("[target:string[]:deployments]")
    .complete("deployments", async () => {
        return await getDeployments();
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
    .action(async ({ file, logLevel, timeout, context, env, envFile }, targets) => {
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
            command: "deploy",
            timeout: timeout,
            logLevel: logLevel,
            context: context,
            env: env,
            envFile: envFile,
            signal: controller.signal,
        };
        await runner.run(options);
    });
