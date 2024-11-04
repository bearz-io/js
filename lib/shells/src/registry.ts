import type { ShellCommand, ShellCommandOptions } from "@bearz/exec";
import { bashScript } from "./bash/command.ts";
import { bunScript } from "./bun/command.ts";
import { pythonScript } from "./python/command.ts";
import { tsxScript } from "./tsx/command.ts";
import { cmdScript } from "./cmd/command.ts";
import { pwshScript } from "./pwsh/command.ts";
import { shScript } from "./sh/command.ts";
import { powershellScript } from "./powershell/command.ts";
import { nodeScript } from "./node/command.ts";
import { denoScript } from "./deno/command.ts";

export type ScriptHandler = (script: string, options?: ShellCommandOptions) => ShellCommand;

const registry = new Map<string, ScriptHandler>();

/**
 * Registers a new shell script handler.
 * @param shell The shell name.
 * @param handler The shell script handler.
 */
export function register(shell: string, handler: ScriptHandler): void {
    registry.set(shell, handler);
}

/**
 * Gets the shell script handler for the specified shell.
 * @param shell The shell name.
 * @returns The shell script handler for the specified shell, or `undefined` if the shell is not registered.
 */
export function get(shell: string): ScriptHandler | undefined {
    return registry.get(shell);
}

/**
 * Gets the shell script handler for the specified shell.
 * @param shell The shell name.
 * @returns The shell script handler for the specified shell.
 */
export function has(shell: string): boolean {
    return registry.has(shell);
}

/**
 * Unregisters a shell script handler.
 * @param shell The shell name.
 */
export function unregister(shell: string): void {
    registry.delete(shell);
}

/**
 * Lists the registered shell script handlers.
 * @returns An iterator for the registered shell script handlers.
 */
export function list(): IterableIterator<[string, ScriptHandler]> {
    return registry.entries();
}

register("bash", bashScript);
register("bun", bunScript);
register("python", pythonScript);
register("tsx", tsxScript);
register("cmd", cmdScript);
register("pwsh", pwshScript);
register("sh", shScript);
register("powershell", powershellScript);
register("node", nodeScript);
register("deno", denoScript);
