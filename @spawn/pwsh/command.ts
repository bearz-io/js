import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    ShellCommand,
    type ShellCommandOptions,
} from "@bearz/exec";

pathFinder.set("pwsh", {
    name: "pwsh",
    windows: [
        "${ProgramFiles}\\PowerShell\\7\\pwsh.exe",
        "${ProgramFiles}\\PowerShell\\6\\pwsh.exe",
    ],
    linux: [
        "/usr/bin/pwsh",
        "/opt/microsoft/powershell/7/pwsh",
        "/opt/microsoft/powershell/6/pwsh",
    ],
});

/**
 * File extension for PowerShell scripts.
 */
export const PWSH_EXT = ".ps1";

/**
 * Represents a powershell command.
 */
export class PwshCommand extends Command {
    /**
     * Creates a new instance of the `PwshCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("pwsh", args, options);
    }
}

/**
 * Represents a PowerShell command executed using the `pwsh` shell.
 */
export class PwshScriptCommand extends ShellCommand {
    /**
     * Creates a new instance of the `PwshScriptCommand` class.
     * @param script The PowerShell script to execute.
     * @param options The options for the shell command.
     */
    constructor(script: string, options?: ShellCommandOptions) {
        super("pwsh", script.trimEnd(), options);
    }

    /**
     * Gets the file extension associated with PowerShell scripts.
     */
    override get ext(): string {
        return PWSH_EXT;
    }

    /**
     * Gets the shell arguments for executing the PowerShell script.
     * @param script The PowerShell script to execute.
     * @param isFile Specifies whether the script is a file or a command.
     * @returns The shell arguments for executing the script.
     */
    override getShellArgs(script: string, isFile: boolean): string[] {
        const params = this.shellArgs ??
            ["-NoLogo", "-NonInteractive", "-NoProfile", "-ExecutionPolicy", "Bypass"];

        if (isFile) {
            params.push("-File", script);
        } else {
            params.push("-Command", script);
        }

        return params;
    }
}

/**
 * Invokes the `pwsh` cli.
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the PwshCommand class.
 * @see {PwshCommand}
 * @example
 * ```ts
 * import { pwsh } from "@spawn/pwsh";
 *
 * const result = pwsh(["-Command", "Write-Host 'Hello, World!'"]);
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function pwsh(args?: CommandArgs, options?: CommandOptions): PwshCommand {
    return new PwshCommand(args, options);
}

/**
* Executes a PowerShell script using the pwsh cli.
*
* @param script - The PowerShell script to execute.
* @param options - Optional options for the shell command.
* @returns A new instance of the PwshScriptCommand class.
* @see {PwshScriptCommand}
* @example
* ```ts
* import { pwsh } from "@spawn/pwsh";
*
* const result = await pwsh.script("Write-Host 'Hello, World!'");
* console.log(result.code);
* console.log(result.text());
* ```
* @example
* ```ts
* import { pwsh } from "@spawn/pwsh";
*
* const result = await pwsh.script("test.ps1");
* console.log(result.code);
* console.log(result.text());
* ```
*/
pwsh.script = function(script: string, options?: ShellCommandOptions): PwshScriptCommand {
   return new PwshScriptCommand(script, options);
}

/**
 * Executes a PowerShell script using the pwsh cli.
 *
 * @param script - The PowerShell script to execute.
 * @param options - Optional options for the shell command.
 * @returns A new instance of the PwshScriptCommand class.
 * @see {PwshScriptCommand}
 * @example
 * ```ts
 * import { pwshScript } from "@spawn/pwsh";
 *
 * const result = await pwshScript("Write-Host 'Hello, World!'");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 * @example
 * ```ts
 * import { pwshScript } from "@spawn/pwsh";
 *
 * const result = await pwshScript("test.ps1");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function pwshScript(script: string, options?: ShellCommandOptions): PwshScriptCommand {
    return new PwshScriptCommand(script, options);
}
