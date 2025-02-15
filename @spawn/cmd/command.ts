import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    ShellCommand,
    type ShellCommandOptions,
} from "@bearz/exec";
import { WINDOWS } from "@bearz/runtime-info/os";
import { makeTempFileSync, writeTextFileSync } from "@bearz/fs";
import { isAbsolute, resolve } from "@std/path";

pathFinder.set("cmd", {
    name: "cmd",
    windows: [
        "${SystemRoot}\\System32\\cmd.exe",
    ],
});

/**
 * File extension for cmd scripts.
 */
export const CMD_EXT = ".cmd";

/**
 * Represents a command for the "cmd" shell.
 */
export class CmdCommand extends Command {
    /**
     * Creates a new instance of the `CmdCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("cmd", args, options);
    }
}

/**
 * Represents a  windows cmd cli command executed using the `cmd` executable.
 */
export class CmdScriptCommand extends ShellCommand {
    /**
     * Creates a new instance of the `CmdScriptCommand` class.
     * @param script The cmd script to execute.
     * @param options The options for the cmdell command.
     */
    constructor(script: string, options?: ShellCommandOptions) {
        super("cmd", script.trimEnd(), options);
    }

    static wslCheck = WINDOWS;

    /**
     * Gets the file extension associated with cmd scripts.
     */
    override get ext(): string {
        return CMD_EXT;
    }

    /**
     * Retrieves the script file and indicates whether it was generated or not.
     * @returns An object containing the file path and a flag
     * indicating if the file was generated.
     */
    override getScriptFile(): { file: string | undefined; generated: boolean } {
        let script = this.script.trimEnd();

        if (script.match(/\n/) || !["cmd", "bat"].some((ext) => script.endsWith(`.${ext}`))) {
            script = `
@echo off
${script}
            `;

            const file = makeTempFileSync({
                prefix: "cmd",
                suffix: this.ext,
            });

            writeTextFileSync(file, script);
            return { file, generated: true };
        }

        script = script.trimStart();
        if (!isAbsolute(script)) {
            script = resolve(script);
        }

        return { file: script, generated: false };
    }

    /**
     * Gets the cmd arguments for executing the cmd script.
     * @param script The cmd script to execute.
     * @param isFile Specifies whether the script is a file or a command.
     * @returns The cmd arguments for executing the script.
     */
    // deno-lint-ignore no-unused-vars
    override getShellArgs(script: string, isFile: boolean): string[] {
        const params = this.shellArgs ?? ["/D", "/E:ON", "/V:OFF", "/S", "/C"];

        params.push(`CALL`, script);

        return params;
    }
}

/**
 * Executes a windows command line (.cmd, .bat) script using the `CmdCommand` class.
 *
 * @param script - The cmd script to execute.
 * @param options - Optional options for the cmd command.
 * @returns A new instance of the CmdCliCommand class.
 */
export function cmd(args?: CommandArgs, options?: CommandOptions): CmdCommand {
    return new CmdCommand(args, options);
}

/**
 * Executes a windows command line (.cmd, .bat) script using the `CmdScriptCommand` class.
 *
 * @param script - The cmd script to execute.
 * @param options - Optional options for the cmd command.
 * @returns A new instance of the CmdCliCommand class.
 * @example
 * ```ts
 * import { cmd } from "@spawn/cmd";
 *
 * const result = await cmd.script("echo Hello, World!");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 * @example
 * ```ts
 * import { cmd } from "@spawn/cmd";
 *
 * const result = await cmd.script("test.cmd");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
cmd.script = function (script: string, options?: ShellCommandOptions): CmdScriptCommand {
    return new CmdScriptCommand(script, options);
}

/**
 * Executes a windows command line (.cmd, .bat) script using the `CmdScriptCommand` class.
 *
 * @param script - The cmd script to execute.
 * @param options - Optional options for the cmd command.
 * @returns A new instance of the CmdCliCommand class.
 * @example
 * ```ts
 * import { cmdScript } from "@spawn/cmd";
 *
 * const result = await cmdScript("echo Hello, World!");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 * @example
 * ```ts
 * import { cmdScript } from "@spawn/cmd";
 *
 * const result = await cmdScript("test.cmd");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function cmdScript(script: string, options?: ShellCommandOptions): CmdScriptCommand {
    return new CmdScriptCommand(script, options);
}
