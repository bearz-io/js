import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    type SplatObject,
} from "@bearz/exec";

pathFinder.set("sftp", {
    name: "sftp",
    windows: [
        "${ProgramFiles}\\OpenSSH\\sftp.exe",
        "${SystemRoot}\\System32\\OpenSSH\\sftp.exe",
    ],
    linux: [
        "/usr/bin/sftp",
    ],
});

/**
 * Represents a SftpCommand.
 *
 * When using the SplatObject for CommandArgs, the
 * `prefix` and `assign` properties are set to "-" and "=" respectively.
 */
export class SftpCommand extends Command {
    /**
     * Creates a new instance of the `SftpCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("sftp", args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            args.splat ??= {};
            args.splat.prefix = "--";
        }
    }
}

/**
 * Executes the sftp command line using the SftpCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the SftpCommand class.
 *
 * @example
 * ```typescript
 * import { sftp } from "@gnome/sftp-cli";
 *
 * await sftp(["user@host", "ls"]);
 * ```
 */
export function sftp(args?: CommandArgs, options?: CommandOptions): SftpCommand {
    return new SftpCommand(args, options);
}
