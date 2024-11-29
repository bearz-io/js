import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("yarn", {
    name: "yarn",
    envVariable: "YARN_EXE",
    windows: [
        ".\\node_modules\\.bin\\yarn.cmd",
        "${APPDATA}\\npm\\yarn.cmd",
        "${LOCALAPPDATA}\\nvs\\default\\yarn.cmd",
    ],
    linux: [
        "./node_modules/.bin/yarn",
        "${HOME}/.local/bin/yarn",
        "/usr/local/bin/yarn",
        "/usr/bin/yarn",
        "${HOME}/.nvs/default/bin/yarn",
    ],
});

/**
 * Represents a yarn command.
 */
export class YarnCommand extends Command {
    /**
     * Creates a new instance of the `YarnCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("yarn", args, options);
    }
}

/**
 * Invokes the `yarn` cli.
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the YarnCommand class.
 * @see {YarnCommand}
 * @example
 * ```ts
 * import { yarn } from "@spawn/node/yarn";
 *
 * const result = yarn(["add", "typescript"], { cwd: "/path/to/project" });
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function yarn(args?: CommandArgs, options?: CommandOptions): YarnCommand {
    return new YarnCommand(args, options);
}
