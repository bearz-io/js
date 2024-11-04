import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    ShellCommand,
    type ShellCommandOptions,
} from "@bearz/exec";
import { isAbsolute, resolve } from "@std/path";
import { makeTempFileSync, writeTextFileSync } from "@bearz/fs";

pathFinder.set("node", {
    name: "node",
    envVariable: "NODE_EXE",
    windows: [
        "#{LOCALAPPDATA}\\Programs\\nodejs\\node.exe",
        "#{LOCALAPPDATA}\\.nodejs\\node.exe",
        "${ProgramFiles}\\nodejs\\node.exe",
    ],
    linux: [
        "${HOME}/.local/bin/node",
        "/usr/local/bin/node",
        "/usr/bin/node",
    ],
});

/**
 * File extension for javascript.
 */
export const NODE_EXT = ".js";

/**
 * Represents a node command.
 */
export class NodeCommand extends Command {
    /**
     * Creates a new instance of the `NodeCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("node", args, options);
    }
}

/**
 * Represents a node script or inline file executed using the `node` commandline.
 */
export class NodeScriptCommand extends ShellCommand {
    /**
     * Creates a new instance of the `NodeScriptCommand` class.
     * @param script The javascript to execute.
     * @param options The options for the node command.
     */
    constructor(script: string, options?: ShellCommandOptions) {
        super("node", script.trimEnd(), options);
    }

    /**
     * Gets the file extension associated with node scripts.
     */
    override get ext(): string {
        return NODE_EXT;
    }

    /**
     * Gets the script file and whether it was generated.
     * @returns the script file and whether it was generated.
     */
    override getScriptFile(): { file: string | undefined; generated: boolean } {
        let script = this.script.trimEnd();

        const exts = [".js", ".mjs", ".cjs"];
        if (!script.match(/\n/) && exts.some((ext) => script.endsWith(ext))) {
            script = script.trimStart();
            if (!isAbsolute(script)) {
                script = resolve(script);
            }
            return { file: script, generated: false };
        }

        const ext = exts.find((ext) => script.endsWith(ext)) ?? ".js";

        const file = makeTempFileSync({
            prefix: "script_",
            suffix: ext,
        });

        writeTextFileSync(file, script);

        return { file, generated: false };
    }

    /**
     * Gets the node arguments for executing the javascript.
     * @param script The javascript to execute.
     * @param isFile Specifies whether the script is a file or a command.
     * @returns The node arguments for executing the script.
     */
    // deno-lint-ignore no-unused-vars
    override getShellArgs(script: string, isFile: boolean): string[] {
        const params = this.shellArgs ?? [];

        params.push(script);

        return params;
    }
}

/**
 * Executes the node command line using the NodeCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the NodeCommand class.
 *
 * @example
 * ```ts
 * import { nodeCli } from "@spawn/node";
 *
 * const result = await node("--version");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 *
 * @example
 * ```ts
 * import { node } from "@spawn/node";
 *
 * /// execute the node command and writes the version to stdout.
 * await node(["--version"]).run();
 * ```
 */
export function node(args?: CommandArgs, options?: CommandOptions): NodeCommand {
    return new NodeCommand(args, options);
}

/**
 * Executes a node inline script or script file using the NodeScriptCommand class.
 *
 * @param script - The node script to execute.
 * @param options - Optional options for the node shell command.
 * @returns A new instance of the NodeScriptCommand class.
 * @see {NodeScriptCommand}
 * @example
 * ```ts
 * import { nodeScript } from "@spawn/node";
 *
 * await nodeScript("console.log('Hello World')").run();
 * ```
 *
 * @example
 * ```ts
 * import { nodeScript } from "@spawn/node";
 *
 * const r = await nodeScript("console.log('Hello World')");
 * console.log(r.code);
 * console.log(r.text());
 * ```
 * @example
 * ```ts
 * import { nodeScript } from "@spawn/node";
 *
 * const r = await nodeScript("test.js");
 * console.log(r.code);
 * console.log(r.text());
 * ```
 */
export function nodeScript(script: string, options?: ShellCommandOptions): NodeScriptCommand {
    return new NodeScriptCommand(script, options);
}
