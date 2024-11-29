import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    type SplatObject,
} from "@bearz/exec";

pathFinder.set("ssh-agent", {
    name: "ssh-agent",
    windows: [
        "${ProgramFiles}\\OpenSSH\\ssh-agent.exe",
        "${SystemRoot}\\System32\\OpenSSH\\ssh-agent.exe",
    ],
    linux: [
        "/usr/bin/ssh-agent",
    ],
});

/**
 * Represents a ssh-agent command.
 *
 * When using the SplatObject for CommandArgs, the
 * `prefix` and `assign` properties are set to "-" and "=" respectively.
 */
export class SshAgentCommand extends Command {
    /**
     * Creates a new instance of the `SshAgentCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("ssh-agent", args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            args.splat ??= {};
            args.splat.prefix = "--";
        }
    }
}

/**
 * Executes the ssh-agent command line using the SshAgentCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the SshAgentCommand class.
 *
 * @example
 * ```typescript
 * import { sshAgent } from "@spawn/ssh-cli";
 *
 * await sshAgent(["-s"]);
 * ```
 */
export function sshAgent(args?: CommandArgs, options?: CommandOptions): SshAgentCommand {
    return new SshAgentCommand(args, options);
}
