import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("npm", {
    name: "npm",
    envVariable: "NPM_EXE",
    windows: [
        "{LOCALAPPDATA}\\Programs\\nodejs\\npm.cmd",
        "{LOCALAPPDATA}\\.nodejs\\npm.cmd",
        "${ProgramFiles}\\nodejs\\npm.cmd",
    ],
    linux: [
        "${HOME}/.local/bin/npm",
        "/usr/local/bin/npm",
        "/usr/bin/npm",
    ],
});

/**
 * Represents a npm command.
 */
export class NpmCommand extends Command {
    /**
     * Creates a new instance of the `NpmCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("npm", args, options);
    }
}

/**
 * Invokes the `npm` cli.
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the NpmCommand class.
 * @see {NpmCommand}
 * @example
 * ```ts
 * import { npm } from "@spawn/node/npm";
 *
 * const result = await npm(["install", "typescript"], { cwd: "/path/to/project" });
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function npm(args?: CommandArgs, options?: CommandOptions): NpmCommand {
    return new NpmCommand(args, options);
}
