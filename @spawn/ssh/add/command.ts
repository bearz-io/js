import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    type SplatObject,
} from "@bearz/exec";

pathFinder.set("ssh-add", {
    name: "ssh-ahh",
    windows: [
        "${ProgramFiles}\\OpenSSH\\ssh-add.exe",
        "${SystemRoot}\\System32\\OpenSSH\\ssh-add.exe",
    ],
    linux: [
        "/usr/bin/ssh-add",
    ],
});

/**
 * Represents a ssh add command.
 *
 * When using the SplatObject for CommandArgs, the
 * `prefix` and `assign` properties are set to "-" and "=" respectively.
 */
export class SshAddCommand extends Command {
    /**
     * Creates a new instance of the `SshAddCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("ssh-add", args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            args.splat ??= {};
            args.splat.prefix = "--";
        }
    }
}

/**
 * Executes the ssh-add command line using the SshAddCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the SshAddCommand class.
 *
 * @example
 * ```typescript
 * import { sshAdd } from "@gnome/ssh-cli";
 *
 * await sshAdd(["-K", "id_rsa"]);
 * ```
 */
export function sshAdd(args?: CommandArgs, options?: CommandOptions): SshAddCommand {
    return new SshAddCommand(args, options);
}
