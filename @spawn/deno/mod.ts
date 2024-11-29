/**
 * ## Overview
 *
 * The deno module wraps the deno cli to provide a simple way to execute
 * javascript using the deno runtime.
 *
 * The module relies upon the [@bearz/exec][exec] module and
 * has the same basic usage as the `Command` and `ShellCommand` class.
 *
 * ## Documentation
 *
 * Documentation is available on [jsr.io](https://jsr.io/@spawn/deno/doc)
 *
 * ## Usage
 *
 * ```typescript
 * import { deno, denoScript } from "@spawn/deno";
 *
 * const result = await deno("--version");
 * console.log(result.code);
 * console.log(result.text());
 *
 * await denoScript(`console.log("test")`);
 * ```
 *
 * ## License
 *
 * [MIT License](./LICENSE.md)
 *
 * [exec]: https://jsr.io/@bearz/exec/doc
 */
export * from "./command.ts";
