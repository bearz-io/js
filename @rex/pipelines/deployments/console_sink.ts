import { deploySymbol, writer } from "../ci/writer.ts";
import type { Message } from "@rex/primitives";
import type {
    CyclicalDeploymentReferences,
    DeploymentCompleted,
    DeploymentFailed,
    DeploymentSkipped,
    DeploymentStarted,
    MissingDeploymentDependencies,
} from "./messages.ts";
import { cyan, green, red } from "@bearz/ansi/styles";
import { AnsiMode, AnsiSettings } from "@bearz/ansi";
import { capitalize } from "@bearz/strings/capitalize";

export function deployConsoleSink(message: Message): void {
    switch (message.kind) {
        case "deployment:missing-dependencies": {
            const msg = message as MissingDeploymentDependencies;
            writer.error(
                `Missing the following deployment dependencies ${msg.deployments.join(",")}`,
            );
            return;
        }

        case "deployment:cyclical-references": {
            const msg = message as CyclicalDeploymentReferences;
            writer.error(`Found deployment cyclical references ${msg.deployments.join(",")}`);
            return;
        }

        case "deployment:started": {
            const msg = message as DeploymentStarted;
            const name = msg.state.name ?? msg.state.id;
            const directive = capitalize(msg.directive);
            let emoji = "🚀";
            if (msg.directive === "rollback") {
                emoji = "🪂";
            } else if (msg.directive === "destroy") {
                emoji = "💥";
            }
            if (AnsiSettings.current.mode === AnsiMode.TwentyFourBit) {
                writer.write(deploySymbol);
                writer.writeLine(` ${emoji} ${directive} ${name} `);
            } else if (AnsiSettings.current.stdout) {
                writer.write(cyan(`❯❯❯❯❯ ${directive} ${name}`));
            } else {
                writer.writeLine(`❯❯❯❯❯ ${directive} ${name}`);
            }
            return;
        }

        case "deployment:skipped": {
            const msg = message as DeploymentSkipped;
            const name = msg.state.name ?? msg.state.id;
            const directive = capitalize(msg.directive);
            let emoji = "🚀";
            if (msg.directive === "rollback") {
                emoji = "🪂";
            } else if (msg.directive === "destroy") {
                emoji = "💥";
            }
            if (AnsiSettings.current.mode === AnsiMode.TwentyFourBit) {
                writer.write(deploySymbol);
                writer.writeLine(` ${emoji} ${directive} ${name} (Skipped)`);
            } else if (AnsiSettings.current.stdout) {
                writer.write(cyan(`❯❯❯❯❯ ${directive} ${name} (Skipped)`));
            } else {
                writer.writeLine(`❯❯❯❯❯ ${directive} ${name} (Skipped)`);
            }
            return;
        }

        case "deployment:failed": {
            const msg = message as DeploymentFailed;
            const name = msg.state.name ?? msg.state.id;
            const directive = capitalize(msg.directive);
            let emoji = "🚀";
            if (msg.directive === "rollback") {
                emoji = "🪂";
            } else if (msg.directive === "destroy") {
                emoji = "💥";
            }
            writer.error(msg.error);
            if (AnsiSettings.current.mode === AnsiMode.TwentyFourBit) {
                writer.write(deploySymbol);
                writer.writeLine(` ${emoji} ${directive} ${name} ${red("failed")}`);
            } else if (AnsiSettings.current.mode === AnsiMode.None) {
                writer.error(`❯❯❯❯❯ ${directive} ${name} failed`);
            } else {
                writer.error(red(`❯❯❯❯❯ ${directive} ${name} failed`));
            }

            writer.endGroup();
            return;
        }

        case "deployment:completed": {
            const msg = message as DeploymentCompleted;
            const duration = msg.result.finishedAt.getTime() - msg.result.startedAt.getTime();
            const ms = duration % 1000;
            const s = Math.floor(duration / 1000) % 60;
            const m = Math.floor(duration / 60000) % 60;
            const directive = capitalize(msg.directive);
            let emoji = "🚀";
            if (msg.directive === "rollback") {
                emoji = "🪂";
            } else if (msg.directive === "destroy") {
                emoji = "💥";
            }

            if (AnsiSettings.current.mode === AnsiMode.TwentyFourBit) {
                // rexWriter.write(deploySymbol)
                writer.write(deploySymbol);
                writer.writeLine(
                    ` ${emoji} ${directive} ${msg.state.name} completed sucessfully in ${
                        green(m.toString())
                    }m ${green(s.toString())}s ${green(ms.toString())}ms`,
                );
            } else {
                writer.success(
                    `${directive} ${
                        msg.state.name ?? msg.state.id
                    } completed in ${m}m ${s}s ${ms}ms`,
                );
            }

            writer.endGroup();
            return;
        }
    }
}
