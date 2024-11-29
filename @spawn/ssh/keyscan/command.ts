import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    type SplatObject,
} from "@bearz/exec";

pathFinder.set("ssh-keyscan", {
    name: "ssh-keyscan",
    windows: [
        "${ProgramFiles}\\OpenSSH\\ssh-keyscan.exe",
        "${SystemRoot}\\System32\\OpenSSH\\ssh-keyscan.exe",
    ],
    linux: [
        "/usr/bin/ssh-keyscan",
    ],
});

/**
 * Represents a SshKeyscanCommand.
 *
 * When using the SplatObject for CommandArgs, the
 * `prefix` and `assign` properties are set to "-" and "=" respectively.
 */
export class SshKeyscanCommand extends Command {
    /**
     * Creates a new instance of the `SshKeyscanCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("ssh-keyscan", args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            args.splat ??= {};
            args.splat.prefix = "--";
        }
    }
}

/**
 * Executes the ssh-keyscan command line using the SshKeyscanCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the SshKeyscanCommand class.
 *
 * @example
 * ```typescript
 * import { ssh-keyscan } from "@spawn/ssh-cli";
 *
 * await ssh-keyscan(["-H", "host"]);
 * ```
 */
export function sshKeyscan(args?: CommandArgs, options?: CommandOptions): SshKeyscanCommand {
    return new SshKeyscanCommand(args, options);
}
