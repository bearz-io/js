import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    type SplatObject,
} from "@bearz/exec";

pathFinder.set("sshd", {
    name: "sshd",
    windows: [
        "${ProgramFiles}\\OpenSSH\\sshd.exe",
        "${SystemRoot}\\System32\\OpenSSH\\sshd.exe",
    ],
    linux: [
        "/usr/bin/sshd",
    ],
});

/**
 * Represents a SshdCommand.
 *
 * When using the SplatObject for CommandArgs, the
 * `prefix` and `assign` properties are set to "-" and "=" respectively.
 */
export class SshdCommand extends Command {
    /**
     * Creates a new instance of the `SshdCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("sshd", args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            args.splat ??= {};
            args.splat.prefix = "--";
        }
    }
}

/**
 * Executes the sshd command line using the SshdCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the SshdCommand class.
 *
 * @example
 * ```typescript
 * import { sshd } from "@gnome/ssh-cli";
 *
 * await sshd(["-D", "1234"]);
 * ```
 */
export function sshd(args?: CommandArgs, options?: CommandOptions): SshdCommand {
    return new SshdCommand(args, options);
}
