import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    ShellCommand,
    type ShellCommandOptions,
} from "@bearz/exec";

pathFinder.set("sh", {
    name: "sh",
    windows: [
        "${ProgramFiles}\\Git\\usr\\bin\\sh.exe",
        "${ChocolateyInstall}\\msys2\\usr\\bin\\sh.exe",
        "${SystemDrive}\\msys64\\usr\\bin\\sh.exe",
        "${SystemDrive}\\msys\\usr\\bin\\sh.exe",
    ],
});

/**
 * File extension for sh scripts.
 */
export const SH_EXT = ".sh";

/**
 * Represents a sh command.
 */
export class ShCommand extends Command {
    /**
     * Creates a new instance of the `ShCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("sh", args, options);
    }
}

/**
 * Represents a Sh command executed using the `sh` commandline.
 */
export class ShScriptCommand extends ShellCommand {
    /**
     * Creates a new instance of the `ShScriptCommand` class.
     * @param script The sh script to execute.
     * @param options The options for the shell command.
     */
    constructor(script: string, options?: ShellCommandOptions) {
        super("sh", script.trimEnd(), options);
    }

    /**
     * Gets the file extension associated with sh scripts.
     */
    override get ext(): string {
        return SH_EXT;
    }

    /**
     * Gets the shell arguments for executing the sh script.
     * @param script The sh script to execute.
     * @param isFile Specifies whether the script is a file or a command.
     * @returns The shell arguments for executing the script.
     */
    override getShellArgs(script: string, isFile: boolean): string[] {
        const params = this.shellArgs ?? ["-e"];

        if (isFile) {
            params.push(script);
        } else {
            params.push("-c", script);
        }

        return params;
    }
}

/**
 * Invokes the `sh` cli.
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the ShCommand class.
 * @example
 * ```ts
 * import { sh } from "@spawn/sh";
 *
 * const r = await sh(["-c", "echo 'Hello, World!'"]);
 * console.log(r.code);
 * console.log(r.text());
 * ```
 *
 * @example
 * ```ts
 * import { sh } from "@spawn/sh";
 *
 * const r = await sh(["test.sh"]);
 * console.log(r.code);
 * console.log(r.text());
 * ```
 */
export function sh(args?: CommandArgs, options?: CommandOptions): ShCommand {
    return new ShCommand(args, options);
}

/**
 * Executes a sh script using the ShCommand class.
 *
 * @param script - The sh script to execute.
 * @param options - Optional options for the shell command.
 * @returns A new instance of the ShCommand class.
 * @see {ShScriptCommand}
 * @example
 * ```ts
 * import { shScript } from "@spawn/sh";
 *
 * const r = await shScript("echo 'Hello, World!';");
 * console.log(r.code);
 * console.log(r.text());
 * ```
 *
 * @example
 * ```ts
 * import { shScript } from "@spawn/sh";
 *
 * const r = await shScript("test.sh");
 * console.log(r.code);
 * console.log(r.text());
 * ```
 */
export function shScript(script: string, options?: ShellCommandOptions): ShScriptCommand {
    return new ShScriptCommand(script, options);
}
