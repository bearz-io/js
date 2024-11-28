import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("npx", {
    name: "npx",
    envVariable: "NPX_EXE",
    windows: [
        "${LOCALAPPDATA}\\Programs\\nodejs\\npx.cmd",
        "${LOCALAPPDATA}\\.nodejs\\npx.cmd",
        "${ProgramFiles}\\nodejs\\npx.cmd",
    ],
    linux: [
        "${HOME}/.local/bin/npx",
        "/usr/local/bin/npx",
        "/usr/bin/npx",
    ],
});

/**
 * Represents a npx command.
 */
export class NpxCommand extends Command {
    /**
     * Creates a new instance of the `PipCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("npx", args, options);
    }
}

/**
 * Invokes the `npx` cli
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the NpxCommand class.
 * @see {NpxCommand}
 * @example
 * ```ts
 * import { npx } from "@spawn/node/npx"
 *
 * const r = await npx("cowsay hello");
 * console.log(r.code);
 * console.log(r.text());
 * ```
 */
export function npx(args?: CommandArgs, options?: CommandOptions): NpxCommand {
    return new NpxCommand(args, options);
}
