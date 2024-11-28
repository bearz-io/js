import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("fnm", {
    name: "fnm",
    envVariable: "FNM_EXE",
    windows: [
        "{LOCALAPPDATA}\\Programs\\nodejs\\Fnm.cmd",
        "{LOCALAPPDATA}\\.nodejs\\Fnm.cmd",
        "${ProgramFiles}\\nodejs\\Fnm.cmd",
    ],
    linux: [
        "${HOME}/.local/bin/Fnm",
        "/usr/local/bin/Fnm",
        "/usr/bin/Fnm",
    ],
});

/**
 * Represents a fnm command.
 */
export class FnmCommand extends Command {
    /**
     * Creates a new instance of the `FnmCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("fnm", args, options);
    }
}

/**
 * Invokes the `fnm` cli.
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the FnmCommand class.
 * @see {FnmCommand}
 * @example
 * ```ts
 * import { fnm } from "@spawn/node/fnm";
 *
 * const result = await fnm(["install", "20"]);
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function fnm(args?: CommandArgs, options?: CommandOptions): FnmCommand {
    return new FnmCommand(args, options);
}
