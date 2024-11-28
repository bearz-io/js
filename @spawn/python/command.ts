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

pathFinder.set("python", {
    name: "python",
    envVariable: "PYTHON_EXE",
    windows: [
        "${SystemDrive}\\Windows\\py.exe",
        "${USERPROFILE}\\AppData\\Local\\Programs\\Python\\Launcher\\py.exe",
    ],
    linux: [
        "/usr/bin/python3",
        "/usr/bin/python",
    ],
});

/**
 * File extension for bash scripts.
 */
export const PYTHON_EXT = ".py";

/**
 * Represents a Python command.
 */
export class PythonCommand extends Command {
    /**
     * Creates a new instance of the `PythonCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("python", args, options);
    }
}

/**
 * Represents a bash command executed using the `bash` commandline.
 */
export class PythonScriptCommand extends ShellCommand {
    /**
     * Creates a new instance of the `bashCommand` class.
     * @param script The bash script to execute.
     * @param options The options for the bashell command.
     */
    constructor(script: string, options?: ShellCommandOptions) {
        super("python", script.trimEnd(), options);
    }

    /**
     * Gets the file extension associated with bash scripts.
     */
    override get ext(): string {
        return PYTHON_EXT;
    }

    override getScriptFile(): { file: string | undefined; generated: boolean } {
        let script = this.script.trimEnd();

        if (!script.match(/\n/) && script.endsWith(this.ext)) {
            script = script.trimStart();
            if (!isAbsolute(script)) {
                script = resolve(script);
            }
            return { file: script, generated: false };
        }

        const file = makeTempFileSync({
            prefix: "script_",
            suffix: this.ext,
        });

        writeTextFileSync(file, script);

        return { file, generated: false };
    }

    /**
     * Gets the bash arguments for executing the bash script.
     * @param script The bash script to execute.
     * @param isFile Specifies whether the script is a file or a command.
     * @returns The bash arguments for executing the script.
     */
    // deno-lint-ignore no-unused-vars
    override getShellArgs(script: string, isFile: boolean): string[] {
        const params = this.shellArgs ?? [];

        params.push(script);

        return params;
    }
}

/**
 * Invokes the `python` cli.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the PythonCommand class.
 * @see {PythonCommand}
 * @example
 * ```ts
 * import { python } from "@spawn/python";
 *
 * const result = await python(["-V"]);
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function python(args?: CommandArgs, options?: CommandOptions): PythonCommand {
    return new PythonCommand(args, options);
}

/**
 * Executes a python inline script or script file using the PythonScriptCommand class.
 *
 * @param script - The python script to execute.
 * @param options - Optional options for the python shell command.
 * @returns A new instance of the PythonScriptCommand class.
 * @example
 * ```ts
 * import { pythonScript } from "@spawn/python";
 *
 * const result = await pythonScript("print('Hello, World!')");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function pythonScript(script: string, options?: ShellCommandOptions): PythonScriptCommand {
    return new PythonScriptCommand(script, options);
}
