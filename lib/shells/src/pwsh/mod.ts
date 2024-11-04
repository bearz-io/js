/**
 * ## Overview
 *
 * The `pwsh` module provides a simple way to execute
 * PowerShell Core scripts or files.
 *
 * The module relies upon the [@bearz/exec][exec] module and
 * has the same basic ussops as the `Command` and `ShellCommand` class.
 *
 * ## Basic Usage
 *
 * ```typescript
 * import { pwshScript, pwsh } from "@bearz/pwsh";
 *
 * const cmd = await pwshScript("Write-Host 'Hello, World!'");
 * console.log(cmd.text());
 * console.log(cmd.code);
 *
 * console.log(await pwshScript("Write-Host 'Hello, World!'").text());
 * console.log(await pwshScript("test.ps1").text());
 *
 * // runs powershell command and writes directly to console
 * await pwshScript("Write-Host 'I am alive'").run();
 *
 * await pwsh(["-ExecutionPolicy", "Bypass", "-File", "path/to/file.ps1"]).run();
 * ```
 *
 * [MIT License](./LICENSE.md)
 *
 * [exec]: https://jsr.io/@bearz/exec/doc
 *
 * @module
 */
export { pwsh, pwshScript } from "./command.ts";
