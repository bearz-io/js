import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("az", {
    name: "az",
    envVariable: "AZ_EXE",
    windows: ["${ProgramFiles}\\Microsoft SDKs\\Azure\\CLI2\\wbin\\az.cmd"],
    linux: ["/usr/bin/az"],
});

/**
 * Represents an az command.
 */
export class AzCommand extends Command {
    /**
     * Represents the az CLI command.
     * @param args - The command arguments.
     * @param options - The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("az", args, options);
    }
}

/**
 * Invokes the `az` cli.
 *
 * @param args - The command arguments.
 * @param options - The command options.
 * @returns A new instance of the AzCommand class.
 * @see {AzCommand}
 */
export function az(args?: CommandArgs, options?: CommandOptions): AzCommand {
    return new AzCommand(args, options);
}
