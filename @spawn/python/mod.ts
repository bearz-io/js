/**
 * ## Overview
 *
 * The `python` module provides a simple way to execute
 * python commands.
 *
 * The module relies upon the [@bearz/exec][exec] module and
 * has the same basic usage as the `Command` and `ShellCommand` class.
 *
 * ## Documentation
 *
 * Documentation is available on [jsr.io](https://jsr.io/@spawn/python/doc)
 *
 * ## Usage
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
 * ## License
 *
 * [MIT License](./LICENSE.md)
 *
 * [exec]: https://jsr.io/@bearz/exec/doc
 */
export * from "./command.ts";
export * from "./uv/command.ts";
export * from "./pip/command.ts";
export * from "./poetry/command.ts";
