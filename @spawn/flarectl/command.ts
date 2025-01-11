import { Command, type CommandArgs, type CommandOptions, pathFinder, SplatObject } from "@bearz/exec";

pathFinder.set("flarectl", {
    name: "flarectl",
    envVariable: "FLARECTL_EXE",
    windows: [
        "${ChocolateyInstall}\\bin\\flarectl.exe",
        "${ChocolateyInstall}\\lib\\flarectl\\tools\\flarectl.exe",
        "${LOCALAPPDATA}\\Programs\\bin\\flarectl.exe",
    ],
    linux: [
        "$HOME/.local/bin/flarectl",
        "/usr/bin/flarectl"
    ],
});


/**
 * Represents an flarectl command.
 */
export class FlarectlCommand extends Command {
    /**
     * Represents the flarectl CLI command.
     * @param args - The command arguments.
     * @param options - The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("flarectl", args, options);
    }
}

/**
 * Invokes the `flarectl` cli.
 *
 * @param args - The command arguments.
 * @param options - The command options.
 * @returns A new instance of the FlarectlCommand class.
 * @see {FlarectlCommand}
 * @example
 * ```ts
 * import { flarectl } from "@spawn/flarectl"
 *
 * const result = await flarectl(["dns", "create", "--zone", "example.com", "--type", "A", "--name", "test", "--content", "10.0.0.1"]);
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function flarectl(args?: CommandArgs, options?: CommandOptions): FlarectlCommand {
    return new FlarectlCommand(args, options);
}

export interface FlarectlGlobalArgs extends SplatObject {
    accountId?: string;

    json?: boolean;

    version?: boolean;

    help?: boolean;
}