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

pathFinder.set("bun", {
    name: "bun",
    windows: [
        "${UserProfile}\\.bun\\bin\\bun.exe",
        "${ALLUSERSPROFILE}\\chocolatey\\lib\\bun\\bun.exe",
        "${ChocolateyInstall}\\lib\\bun\\bun.exe",
    ],
    linux: [
        "${HOME}/.bun/bin/bun",
        "/usr/local/bin/bun",
        "/usr/bin/bun",
    ],
});

/**
 * File extension for javascript.
 */
export const BUN_EXT = ".ts";

/**
 * Represents a bun command.
 */
export class BunCommand extends Command {
    /**
     * Creates a new instance of the `BunCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("bun", args, options);
    }
}

/**
 * Represents a bun script or inline file executed using the `bun` commandline.
 */
export class BunScriptCommand extends ShellCommand {
    /**
     * Creates a new instance of the `BunScriptCommand` class.
     * @param script The javascript to execute.
     * @param options The options for the bun command.
     */
    constructor(script: string, options?: ShellCommandOptions) {
        super("bun", script.trimEnd(), options);
    }

    /**
     * Gets the file extension associated with Deno scripts.
     */
    override get ext(): string {
        return BUN_EXT;
    }

    override getScriptFile(): { file: string | undefined; generated: boolean } {
        let script = this.script.trimEnd();

        const exts = [".ts", ".js"];
        if (!script.match(/\n/) && exts.some((ext) => script.endsWith(ext))) {
            script = script.trimStart();
            if (!isAbsolute(script)) {
                script = resolve(script);
            }
            return { file: script, generated: false };
        }

        const ext = exts.find((ext) => script.endsWith(ext)) ?? ".ts";

        const file = makeTempFileSync({
            prefix: "script_",
            suffix: ext,
        });

        writeTextFileSync(file, script);

        return { file, generated: false };
    }

    /**
     * Gets the Deno arguments for executing the javascript.
     * @param script The javascript to execute.
     * @param isFile Specifies whether the script is a file or a command.
     * @returns The Deno arguments for executing the script.
     */
    // deno-lint-ignore no-unused-vars
    override getShellArgs(script: string, isFile: boolean): string[] {
        const params = this.shellArgs ??
            [
                "run",
            ];

        params.push(script);

        return params;
    }
}

/**
 * Invoke the `bun` cli.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the BunCommand class.
 *
 * @example
 * ```ts
 * import { bun } from "@spawn/xv/bun";
 *
 * const result = await bun("--version");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 *
 * @example
 * ```ts
 * import { bun } from "@spawn/xv/bun";
 *
 * /// execute the Deno command and writes the version to stdout.
 * await bun(["--version"]).run();
 * ```
 */
export function bun(args?: CommandArgs, options?: CommandOptions): BunCommand {
    return new BunCommand(args, options);
}

/**
 * Invoke the `bun` cli to execute a script.
 *
 * @param script - The Deno script to execute.
 * @param options - Optional options for the Deno shell command.
 * @returns A new instance of the BunScriptCommand class.
 * @example
 * ```ts
 * import { bunScript } from "@spawn/dev/bun";
 *
 * const result = await bunScript("console.log('Hello, World!');");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 * @example
 * ```ts
 * import { bunScript } from "@spawn/dev/bun";
 *
 * const result = await bunScript("test.ts");
 * console.log(result.code);
 * console.log(result.text());
 */
export function bunScript(script: string, options?: ShellCommandOptions): BunScriptCommand {
    return new BunScriptCommand(script, options);
}
