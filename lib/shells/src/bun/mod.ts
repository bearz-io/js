/**
 * ## Overview
 *
 * The `bun-cli` module provides a simple way to execute
 * inline Javascript or JavaScript files with bun.
 *
 * The module relies upon the @bearz/exec module and
 * has the same basic usage as the `Command` and `ShellCommand` class.
 *
 * ## Basic Usage
 *
 * ```typescript
 * import { bunScript } from "@bearz/shells/dev/bun";
 *
 * const cmd = bunScript("console.log('Hello, World!');");
 *
 * // execute the node command and writes "Hello, World!" to stdout.
 * await cmd.run();
 *
 * // run a script and writes output to stdout and stderr.
 * await bunScript("./test.js").run();
 *
 * const r = await bunScript("console.log('Hello, World!');");
 * console.log(r.code);
 * console.log(r.text());
 * ```
 *
 * [MIT License](./LICENSE.md)
 *
 * @module
 */
export { bun, bunScript } from "./command.ts";
