import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    ShellCommand,
    type ShellCommandOptions,
} from "@bearz/exec";

pathFinder.set("powershell", {
    name: "powershell",
    envVariable: "POWERSHELL_EXE",
    windows: [
        "${WinDir}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
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
export class PowerShellCommand extends Command {
    /**
     * Creates a new instance of the `PowerShellCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("powershell", args, options);
    }
}

/**
 * Represents a PowerShell command executed using `powershell`.
 */
export class PowerShellScriptCommand extends ShellCommand {
    /**
     * Creates a new instance of the `PowerShellScriptCommand` class.
     * @param script The PowerShell script to execute.
     * @param options The options for the shell command.
     */
    constructor(script: string, options?: ShellCommandOptions) {
        super("powershell", script.trimEnd(), options);
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
 * Executes a PowerShell command using the PowerShellCommand class.
 *
 * @param args - The command arguments.
 * @param options - Optional options for the shell command.
 * @returns A new instance of the PowerShellCommand class.
 */
export function powershell(args?: CommandArgs, options?: CommandOptions): PowerShellCommand {
    return new PowerShellCommand(args, options);
}

/**
 * Executes a PowerShell script using the PowerShellCommand class.
 *
 * @param script - The PowerShell script to execute.
 * @param options - Optional options for the shell command.
 * @returns A new instance of the PwshCommand class.
 * @example
 * ```ts
 * import { powershellScript } from "@spawn/powershell";
 *
 * const result = await powershellScript("Write-Host 'Hello, World!'");
 * console.log(result.code);
 * console.log(await result.text());
 * ```
 * @example
 * ```ts
 * import { powershellScript } from "@spawn/powershell";
 *
 * const result = await powershellScript("test.ps1");
 * console.log(result.code);
 * console.log(await result.text());
 * ```
 */
export function powershellScript(
    script: string,
    options?: ShellCommandOptions,
): PowerShellScriptCommand {
    return new PowerShellScriptCommand(script, options);
}
