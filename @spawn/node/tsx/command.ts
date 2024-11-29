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

pathFinder.set("tsx", {
    name: "tsx",
    envVariable: "TSX_EXE",
    windows: [
        ".\\node_modules\\.bin\\tsx.cmd",
        "${APPDATA}\\npm\\tsx.cmd",
        "${LOCALAPPDATA}\\nvs\\default\\tsx.cmd",
    ],
    linux: [
        "./node_modules/.bin/tsx",
        "${HOME}/.local/bin/tsx",
        "/usr/local/bin/tsx",
        "/usr/bin/tsx",
        "/usr/local/lib/node_modules/.bin/tsx",
        "${HOME}/.nvs/default/bin/tsx",
    ],
});

export const TSX_EXT = ".ts";

/**
 * Represents a tsx cli command.
 */
export class TsxCommand extends Command {
    /**
     * Creates a new instance of the `TsxCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("tsx", args, options);
    }
}

/**
 * Represents a tsx script or incline command executed using the `tsx` commandline.
 */
export class TsxScriptCommand extends ShellCommand {
    /**
     * Creates a new instance of the `TsxShellCommand` class.
     * @param script The bash script to execute.
     * @param options The options for the bashell command.
     */
    constructor(script: string, options?: ShellCommandOptions) {
        super("tsx", script.trimEnd(), options);
    }

    /**
     * Gets the file extension associated with bash scripts.
     */
    override get ext(): string {
        return TSX_EXT;
    }

    /**
     * Gets the script file and whether it was generated.
     * @returns the script file and whether it was generated.
     */
    override getScriptFile(): { file: string | undefined; generated: boolean } {
        let script = this.script.trimEnd();

        const exts = [".ts", ".mts", ".cts"];
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
     * Gets the tsx arguments for executing the typescript file.
     * @param script The typescript to execute.
     * @param isFile Specifies whether the script is a file or a command.
     * @returns The tsx arguments for executing the script.
     */
    // deno-lint-ignore no-unused-vars
    override getShellArgs(script: string, isFile: boolean): string[] {
        const params = this.shellArgs ?? [];

        params.push(script);

        return params;
    }
}

/**
 * Invokes the `tsx` cli.
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the TsxCommand class.
 * @see {TsxCommand}
 * @example
 * ```ts
 * import { tsx } from "@spawn/node/tsx";
 *
 * const result = await tsx("--version");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function tsx(args?: CommandArgs, options?: CommandOptions): TsxCommand {
    return new TsxCommand(args, options);
}

/**
 * Executes a typescript inline script or script file using `tsx` cli.
 *
 * @param script - The type script code or file to execute.
 * @param options - Optional options for the tsx shell command.
 * @returns A new instance of the TsxScriptCommand class.
 * @see {TsxScriptCommand}
 * @example
 * ```ts
 * import { tsxScript } from "@spawn/node/tsx";
 *
 * const result = await tsxScript("console.log('Hello, World!');");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function tsxScript(script: string, options?: ShellCommandOptions): TsxScriptCommand {
    return new TsxScriptCommand(script, options);
}
