/**
 * ## Overview
 *
 * The `cmd` module provides a simple way to execute
 * windows command line scripts or files.
 *
 * The module relies upon the [@bearz/exec][exec] module and
 * has the same basic usage as the `Command` and `ShellCommand` class.
 *
 * ## Basic Usage
 *
 * ```typescript
 * import { cmdScript, cmd } from "@bearz/shells/cmd";
 *
 * const cmd2 = await cmdScript("echo Hello, World!");
 * console.log(cmd2.text());
 * console.log(cmd2.code);
 *
 * console.log(await cmdScript("echo Hello, World!").text());
 *
 * console.log(await cmdScript("test.cmd").text());
 *
 * // runs a windows command and writes directly to console
 * await cmd("/c echo hello").run();
 * ```
 *
 * [MIT License](./LICENSE.md)
 *
 * [exec]: https://jsr.io/@bearz/exec/doc
 *
 * @module
 */
export { cmd, cmdScript } from "./command.ts";
