/**
 * ## Overview
 *
 * The `terraform` module provides a simple way to execute
 * terraform commands.
 *
 * The module relies upon the [@bearz/exec][exec] module and
 * has the same basic usage as the `Command` and `ShellCommand` class.
 *
 * ## Basic Usage
 *
 * ```typescript
 * import { terraform } from "@spawn/terraform";
 *
 * const result = terraform("--version");
 * console.log(result.code);
 * console.log(result.text());
 *
 * ```
 *
 * [MIT License](./LICENSE.md)
 *
 * [exec]: https://jsr.io/@bearz/exec/doc
 */
export * from "./command.ts";
