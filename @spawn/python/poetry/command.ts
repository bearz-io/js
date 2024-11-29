import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("poetry", {
    name: "poetry",
    envVariable: "POETRY_EXE",
    windows: [],
    linux: [
        "/usr/bin/poetry",
    ],
});

/**
 * Represents a command for executing poetry-related operations.
 */
export class PoetryCommand extends Command {
    /**
     * Creates a new instance of the `PoetryCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("poetry", args, options);
    }
}

/**
 * Invokes the `poetry` cli.
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the PoetryCommand class.
 * @example
 * ```ts
 * import { poetry } from "@spawn/python/poetry";
 *
 * const r = await poetry(["install", "requests"]);
 * console.log(r.stdout);
 * console.log(r.text());
 * console.log(r.code);
 * ```
 */
export function poetry(args?: CommandArgs, options?: CommandOptions): PoetryCommand {
    return new PoetryCommand(args, options);
}
