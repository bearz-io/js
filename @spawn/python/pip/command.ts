import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("pip", {
    name: "pip",
    envVariable: "PIP_EXE",
    windows: [],
    linux: [
        "/usr/bin/pip3",
        "/usr/bin/pip",
    ],
});

/**
 * Represents a pip command.
 */
export class PipCommand extends Command {
    /**
     * Creates a new instance of the `PipCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("pip", args, options);
    }
}

/**
 * Invokes the `pip` cli.
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the PipCommand class.
 *
 * @example
 *
 * ```ts
 * import { pip } from "@spawn/python/pip";
 *
 * const r = await pip(["install", "requests"]);
 * console.log(r.stdout);
 * console.log(r.text());
 * console.log(r.code);
 * ```
 */
export function pip(args?: CommandArgs, options?: CommandOptions): PipCommand {
    return new PipCommand(args, options);
}
