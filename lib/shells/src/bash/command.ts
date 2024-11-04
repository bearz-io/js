import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    ShellCommand,
    type ShellCommandOptions,
} from "@bearz/exec";
import { WINDOWS } from "@bearz/runtime-info/os";
import { isFile } from "@bearz/fs";
import { isAbsolute, resolve } from "@std/path";

pathFinder.set("bash", {
    name: "bash",
    envVariable: "BASH_EXE",
    windows: [
        "${ProgramFiles}\\Git\\bin\\bash.exe",
        "${ProgramFiles}\\Git\\usr\\bin\\bash.exe",
        "${ChocolateyInstall}\\msys2\\usr\\bin\\bash.exe",
        "${SystemDrive}\\msys64\\usr\\bin\\bash.exe",
        "${SystemDrive}\\msys\\usr\\bin\\bash.exe",
        "${SystemRoot}\\System32\\bash.exe",
    ],
});

let wslEnabled = false;

wslEnabled = WINDOWS && await isFile("C:\\Windows\\System32\\bash.exe");

/**
 * File extension for bash scripts.
 */
export const BASH_EXT = ".sh";

/**
 * Represents a bash command.
 */
export class BashCommand extends Command {
    /**
     * Creates a new instance of the `BashCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     * @see {Command}
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("bash", args, options);
    }
}

/**
 * Represents a bash command executed using the `bash` commandline.
 */
export class BashScriptCommand extends ShellCommand {
    /**
     * Creates a new instance of the `bashCommand` class.
     * @param script The bash script to execute.
     * @param options The options for the bashell command.
     */
    constructor(script: string, options?: ShellCommandOptions) {
        super("bash", script.trimEnd(), options);
    }

    static wslCheck = WINDOWS;

    /**
     * Gets the file extension associated with bash scripts.
     */
    override get ext(): string {
        return BASH_EXT;
    }

    /**
     * Gets the bash arguments for executing the bash script.
     * @param script The bash script to execute.
     * @param isFile Specifies whether the script is a file or a command.
     * @returns The bash arguments for executing the script.
     */
    override getShellArgs(script: string, isFile: boolean): string[] {
        const params = this.shellArgs ?? ["-noprofile", "--norc", "-e", "-o", "pipefail"];

        if (isFile) {
            if (BashScriptCommand.wslCheck && wslEnabled) {
                const exe = pathFinder.findExeSync("bash");
                if (exe && exe.endsWith("System32\\bash.exe")) {
                    if (!isAbsolute(script)) {
                        script = resolve(script);
                    }

                    script = "/mnt/" + script[0].toLowerCase() +
                        script.slice(2).replace(/\\/g, "/");
                }
            }

            params.push(script);
        } else {
            params.push("-c", script);
        }

        return params;
    }
}

/**
 * Invokes the `bash` cli.
 *
 * @param args - The command arguments.
 * @param options - Optional options for the bash command.
 * @returns A new instance of the BashCommand class.
 * @see {BashCommand}
 * @example
 * ```ts
 * import { bash } from "@spawn/bash";
 *
 * const result = await bash(["--version"]);
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function bash(args?: CommandArgs, options?: CommandOptions): BashCommand {
    return new BashCommand(args, options);
}

/**
 * Executes a bash script using the bash cli.
 *
 * @param script - The bash script to execute.
 * @param options - Optional options for the bash command.
 * @returns A new instance of the BashCommand class.
 * @see {BashScriptCommand}
 * @example
 * ```ts
 * import { bashScript } from "@spawn/bash";
 *
 * const result = bashScript("echo 'Hello, World!'");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 * @example
 * ```ts
 * import { bashScript } from "@spawn/bash";
 *
 * const result = await bashScript("test.sh");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function bashScript(script: string, options?: ShellCommandOptions): BashScriptCommand {
    return new BashScriptCommand(script, options);
}
