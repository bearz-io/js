import type { ShellCommand, ShellCommandOptions } from "@bearz/exec";
import { WINDOWS } from "@bearz/runtime-info/os";
import { get } from "./registry.ts";

export type Shells =
    | "bash"
    | "bun"
    | "cmd"
    | "deno"
    | "node"
    | "powershell"
    | "pwsh"
    | "python"
    | "sh"
    | "tsx"
    | string;

export interface RunOptions extends ShellCommandOptions, Record<string, unknown> {
    shell?: Shells;
}

/**
 * Executes a shell script with the given options.
 *
 * If the shell is not specified, the default shell is determined by the operating system.
 *
 * @param script - The shell script to be executed.
 * @param options - Optional parameters to customize the shell command execution.
 * @returns A `ShellCommand` object representing the executed command.
 * @throws An error if the shell is not registered.
 */
export function script(script: string, options?: RunOptions): ShellCommand {
    let shell = options?.shell;
    if (shell && options) {
        delete options["shell"];
    }

    if (!shell) {
        shell = WINDOWS ? "powershell" : "bash";
    }

    const handler = get(shell);
    if (!handler) {
        throw new Error(`The shell '${shell}' is not registered.`);
    }

    return handler(script, options);
}
