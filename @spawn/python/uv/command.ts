import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("uv", {
    name: "uv",
    envVariable: "UV_EXE",
    windows: [
        "${LOCALAPPDATA}\\uv\\uv.exe",
    ],
    linux: [
        "/usr/bin/uv",
        "${HOME}/.local/bin/uv",
    ],
});

/**
 * Represents a command for executing uv operations.
 */
export class UvCommand extends Command {
    /**
     * Creates a new instance of the `UvCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("uv", args, options);
    }
}

/**
 * Invokes the `uv` cli.
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the UvCommand class.
 * @example
 * ```ts
 * import { uv } from "@spawn/python/uv";
 *
 * const r = await uv(["--version"]);
 * console.log(r.stdout);
 * console.log(r.text());
 * console.log(r.code);
 * ```
 */
export function uv(args?: CommandArgs, options?: CommandOptions): UvCommand {
    return new UvCommand(args, options);
}
