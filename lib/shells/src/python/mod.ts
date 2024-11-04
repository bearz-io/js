/**
 * ## Overview
 *
 * The `python` module provides a simple way to execute
 * python commands.
 *
 * The module relies upon the [@bearz/exec][exec] module and
 * has the same basic usage as the `Command` and `ShellCommand` class.
 *
 * ## Basic Usage
 *
 * ```typescript
 * import { pythonScript, python } from "@spawn/python";
 *
 * const cmd = await pythonScript("print('Hello, World!')");
 * console.log(await cmd.text());
 * console.log(cmd.code);
 *
 * console.log(await pythonScript("print('Hello, World!')").text());
 *
 * console.log(await pythonScript("test.py").text());
 * console.log(await python(["test.py"]).text())
 * console.log(await python(["-V"]).text());
 *
 * // runs python script and writes directly to console
 * await pythonScript("print('I am alive')").run();
 * ```
 *
 * [MIT License](./LICENSE.md)
 *
 * [exec]: https://jsr.io/@bearz/exec/doc
 *
 * @module
 */
export { python, pythonScript } from "./command.ts";
export { pip } from "./pip/command.ts";
