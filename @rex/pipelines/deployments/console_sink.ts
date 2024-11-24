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
            if (AnsiSettings.current.mode === AnsiMode.TwentyFourBit) {
                writer.write(deploySymbol);
                writer.writeLine(` 🚀 ${name} `);
            } else if (AnsiSettings.current.stdout) {
                writer.write(cyan(`❯❯❯❯❯ ${name}`));
            } else {
                writer.writeLine(`❯❯❯❯❯ ${name}`);
            }
            return;
        }

        case "deployment:skipped": {
            const msg = message as DeploymentSkipped;
            const name = msg.state.name ?? msg.state.id;
            if (AnsiSettings.current.mode === AnsiMode.TwentyFourBit) {
                writer.write(deploySymbol);
                writer.writeLine(` 🚀 ${name} (Skipped)`);
            } else if (AnsiSettings.current.stdout) {
                writer.write(cyan(`❯❯❯❯❯ ${name} (Skipped)`));
            } else {
                writer.writeLine(`❯❯❯❯❯ ${name} (Skipped)`);
            }
            return;
        }

        case "deployment:failed": {
            const msg = message as DeploymentFailed;
            const name = msg.state.name ?? msg.state.id;
            writer.error(msg.error);
            if (AnsiSettings.current.mode === AnsiMode.TwentyFourBit) {
                writer.write(deploySymbol);
                writer.writeLine(` 🚀 ${name} ${red("failed")}`);
            } else if (AnsiSettings.current.mode === AnsiMode.None) {
                writer.error(`❯❯❯❯❯ ${name} failed`);
            } else {
                writer.error(red(`❯❯❯❯❯ ${name} failed`));
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

            if (AnsiSettings.current.mode === AnsiMode.TwentyFourBit) {
                // rexWriter.write(deploySymbol)
                writer.write(deploySymbol);
                writer.writeLine(
                    ` 🚀 ${msg.state.name} completed sucessfully in ${green(m.toString())}m ${
                        green(s.toString())
                    }s ${green(ms.toString())}ms`,
                );
            } else {
                writer.success(
                    `${msg.state.name ?? msg.state.id} completed in ${m}m ${s}s ${ms}ms`,
                );
            }

            writer.endGroup();
            return;
        }
    }
}
