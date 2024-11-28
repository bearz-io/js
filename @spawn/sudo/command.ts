import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("sudo", {
    name: "sudo",
    windows: [
        "${SystemRoot}\\System32\\sudo.exe",
    ],
    linux: [
        "/usr/bin/sudo",
    ],
});

function convertCommand(args?: CommandArgs | Command): CommandArgs | undefined {
    if (args === undefined) {
        return undefined;
    }

    if (args instanceof Command) {
        return args.toArgs();
    }

    return args as CommandArgs;
}

/**
 * Represents a sudo command.
 */
export class SudoCommand extends Command {
    /**
     * Creates a new instance of the `SudoCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs | Command, options?: CommandOptions) {
        super("sudo", convertCommand(args), options);
    }
}

/**
 * Invokes the `sudo`.
 * @param args - The command arguments.
 * @param options - The command options.
 * @returns A new instance of the SudoCommand class.
 * @see {SudoCommand}
 * @example
 * ```ts
 * import { sudo } from "@spawn/sudo"
 *
 * const result = await sudo("ls");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function sudo(args?: CommandArgs | Command, options?: CommandOptions): SudoCommand {
    return new SudoCommand(args, options);
}
