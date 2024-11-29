import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    type SplatObject,
} from "@bearz/exec";

pathFinder.set("scp", {
    name: "scp",
    windows: [
        "${ProgramFiles}\\OpenSSH\\scp.exe",
        "${SystemRoot}\\System32\\OpenSSH\\scp.exe",
    ],
    linux: [
        "/usr/bin/scp",
    ],
});

/**
 * Represents a ScpCommand.
 *
 * When using the SplatObject for CommandArgs, the
 * `prefix` and `assign` properties are set to "-" and "=" respectively.
 */
export class ScpCommand extends Command {
    /**
     * Creates a new instance of the `ScpCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("scp", args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            args.splat ??= {};
            args.splat.prefix = "--";
        }
    }
}

/**
 * Executes the scp command line using the ScpCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the ScpCommand class.
 *
 * @example
 * ```typescript
 * import { scp } from "@spawn/ssh-cli";
 *
 * await scp(["file.txt", "user@host:/path/to/destination"]).run();
 * ```
 */
export function scp(args?: CommandArgs, options?: CommandOptions): ScpCommand {
    return new ScpCommand(args, options);
}
