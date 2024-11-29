import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    type SplatObject,
} from "@bearz/exec";

pathFinder.set("ssh-keygen", {
    name: "ssh-keygen",
    windows: [
        "${ProgramFiles}\\OpenSSH\\ssh-keygen.exe",
        "${SystemRoot}\\System32\\OpenSSH\\ssh-keygen.exe",
    ],
    linux: [
        "/usr/bin/ssh-keygen",
    ],
});

/**
 * Represents a SshKeygenCommand.
 *
 * When using the SplatObject for CommandArgs, the
 * `prefix` and `assign` properties are set to "-" and "=" respectively.
 */
export class SshKeygenCommand extends Command {
    /**
     * Creates a new instance of the `SshKeygenCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("ssh-keygen", args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            args.splat ??= {};
            args.splat.prefix = "--";
        }
    }
}

/**
 * Executes the ssh-keygen command line using the SshKeygenCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the SshKeygenCommand class.
 *
 * @example
 * ```typescript
 * import { ssh-keygen } from "@gnome/ssh-cli";
 *
 * await ssh-keygen(["-t", "rsa", "-b", "4096", "-C", "", "-f", "id_rsa", "-N", ""]).run();
 * ```
 */
export function sshKeygen(args?: CommandArgs, options?: CommandOptions): SshKeygenCommand {
    return new SshKeygenCommand(args, options);
}
