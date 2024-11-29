/**
 * ## Overview
 *
 * The node module wraps the node cli to provide a simple way to execute
 * javascript using the node runtime.
 *
 * The module relies upon the [@bearz/exec][exec] module and
 * has the same basic usage as the `Command` and `ShellCommand` class.
 *
 * ## Documentation
 *
 * Documentation is available on [jsr.io](https://jsr.io/@spawn/node/doc)
 *
 * ## Usage
 * ```typescript
 * import { nodeScript } from '@spawn/node'
 *
 * // outputs directly to stdout and stderror streams.
 * await nodeScript("console.log('Hello')").run();
 *
 * // pipes the output
 * const result = await nodeScript("console.log('Hello')");
 * console.log(result.stdout);
 * console.log(result.text());
 * console.log(result.code);
 *
 * // invoke a file
 * const result2 = await nodeScript("test.js", { cwd: '/tmp' });
 * console.log(result.stdout);
 * console.log(result.text());
 * console.log(result.code);
 * ```
 *
 * ```typescript
 * import { node } from '@spawn/node'
 *
 * // outputs directly to stdout and stderror streams.
 * await node("-h").run();
 *
 * // pipes the output
 * const result = await node("-h");
 * console.log(result.stdout);
 * console.log(result.text());
 * console.log(result.code);
 * ```
 *
 * ## License
 *
 * [MIT License](./LICENSE.md)
 *
 * [exec]: https://jsr.io/@bearz/exec/doc
 */
export * from "./command.ts";
export * from "./fnm/mod.ts";
export * from "./npm/mod.ts";
export * from "./npx/mod.ts";
export * from "./pnpm/mod.ts";
export * from "./tsx/mod.ts";
export * from "./yarn/mod.ts";
