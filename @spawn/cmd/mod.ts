/**
 * ## Overview
 *
 * The `cmd` module provides a simple way to execute
 * windows command line scripts or files.
 *
 * The module relies upon the [@bearz/exec][exec] module and
 * has the same basic usage as the `Command` and `ShellCommand` class.
 *
 * ## Documentation
 *
 * Documentation is available on [jsr.io](https://jsr.io/@spawn/cmd/doc)
 *
 * ## Usage
 *
 * ```typescript
 * import { cmdScript, cmd } from "@spawn/cmd";
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
 * ## License
 *
 * [MIT License](./LICENSE.md)
 *
 * [exec]: https://jsr.io/@bearz/exec/doc
 */
export * from "./command.ts";
