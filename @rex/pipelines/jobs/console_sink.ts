import { jobSymbol, writer } from "../ci/writer.ts";
import type { Message } from "@rex/primitives";
import type {
    CyclicalJobReferences,
    JobCompleted,
    JobFailed,
    JobSkipped,
    JobStarted,
    MissingJobDependencies,
} from "./messages.ts";
import { cyan, green, red, reset } from "@bearz/ansi/styles";
import { AnsiMode, AnsiSettings } from "@bearz/ansi";

export function jobsConsoleSink(message: Message): void {
    switch (message.kind) {
        case "job:missing-dependencies": {
            const msg = message as MissingJobDependencies;
            writer.error(`Missing the following job dependencies ${msg.jobs.join(",")}`);
            return;
        }

        case "job:cyclical-references": {
            const msg = message as CyclicalJobReferences;
            writer.error(`Found job cyclical references ${msg.jobs.join(",")}`);
            return;
        }

        case "job:started": {
            const msg = message as JobStarted;
            const name = msg.job.name ?? msg.job.id;
            if (AnsiSettings.current.mode === AnsiMode.TwentyFourBit) {
                writer.write(jobSymbol).write(reset(" "));
                writer.writeLine(`${name} `);
            } else if (AnsiSettings.current.stdout) {
                writer.write(cyan(`❯❯❯❯❯ ${name}`));
            } else {
                writer.writeLine(`❯❯❯❯❯ ${name}`);
            }
            return;
        }

        case "job:skipped": {
            const msg = message as JobSkipped;
            const name = msg.job.name ?? msg.job.id;
            writer.skipGroup(name);
            return;
        }

        case "job:failed": {
            const msg = message as JobFailed;
            const name = msg.job.name ?? msg.job.id;
            writer.error(msg.error);
            if (AnsiSettings.current.mode === AnsiMode.TwentyFourBit) {
                writer.write(jobSymbol).write(reset(" "));
                writer.writeLine(`${name} ${red("failed")}`);
            } else if (AnsiSettings.current.mode === AnsiMode.None) {
                writer.error(`❯❯❯❯❯ ${name} failed`);
            } else {
                writer.error(red(`❯❯❯❯❯ ${name} failed`));
            }

            writer.endGroup();
            return;
        }

        case "job:completed": {
            const msg = message as JobCompleted;
            const duration = msg.result.finishedAt.getTime() - msg.result.startedAt.getTime();
            const ms = duration % 1000;
            const s = Math.floor(duration / 1000) % 60;
            const m = Math.floor(duration / 60000) % 60;

            if (AnsiSettings.current.mode === AnsiMode.TwentyFourBit) {
                // rexWriter.write(groupSymbol)
                writer.write(jobSymbol);
                writer.writeLine(
                    ` ${msg.job.name ?? msg.job.id} completed sucessfully in ${
                        green(m.toString())
                    }m ${green(s.toString())}s ${green(ms.toString())}ms`,
                );
            } else {
                writer.success(
                    `${msg.job.name ?? msg.job.id} completed in ${m}m ${s}s ${ms}ms`,
                );
            }

            writer.endGroup();
            return;
        }
    }
}
