/**
 * ## Overview
 *
 * The node module wraps the node cli to provide a simple way to execute
 * javascript using the node runtime.
 *
 * The module relies upon the [@bearz/exec][exec] module and
 * has the same basic usage as the `Command` and `ShellCommand` class.
 *
 * ## Basic Usage
 *
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
 * [MIT](./LICENSE.md)
 *
 * [exec]: https://jsr.io/@bearz/exec/doc
 *
 * @module
 */
export { node, nodeScript } from "./command.ts";
