/**
 * ## Overview
 *
 * The bun module wraps the bun cli to provide a simple way to execute
 * javascript using the bun runtime.
 *
 * The module relies upon the [@bearz/exec][exec] module and
 * has the same basic usage as the `Command` and `ShellCommand` class.
 *
 * ## Documentation
 *
 * Documentation is available on [jsr.io](https://jsr.io/@spawn/bun/doc)
 *
 * ## Usage
 * ```typescript
 * import { bun, bunScript } from "@spawn/bun";
 *
 * const result = await bun("--version");
 * console.log(result.code);
 * console.log(result.text());
 *
 * await bunScript(`console.log("test")`);
 * ```
 *
 * ## License
 *
 * [MIT License](./LICENSE.md)
 *
 * [exec]: https://jsr.io/@bearz/exec/doc
 */
export * from "./command.ts";
