/**
 * ## Overview
 *
 * The `powershell` module provides a simple way to execute
 * PowerShell scripts or files on Windows.
 *
 * The module relies upon the [@bearz/exec][exec] module and
 * has the same basic ussops as the `Command` and `ShellCommand` class.
 *
 * ## Basic Usage
 *
 * ```typescript
 * import { powershellScript, powershell } from "@bearz/powershell";
 *
 * const cmd = await powershellScript("Write-Host 'Hello, World!'");
 * console.log(cmd.text());
 * console.log(cmd.code);
 *
 * console.log(await powershellScript("Write-Host 'Hello, World!'").text());
 * console.log(await powershellScript("test.ps1").text());
 *
 * // runs powershell command and writes directly to console
 * await powershellScript("Write-Host 'I am alive'").run();
 *
 * await powershell(["-ExecutionPolicy", "Bypass", "-File", "path/to/file.ps1"]).run();
 * ```
 *
 * [MIT License](./LICENSE.md)
 *
 * [exec]: https://jsr.io/@bearz/exec/doc
 *
 * @module
 */
export { powershell, powershellScript } from "./command.ts";
