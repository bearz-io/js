/**
 * # @bearz/runtime-info
 *
 * Gets information about the current javascript rutime such as
 * the runtime name, version, the current os, and the current architecture.
 *
 * ## Documentation
 *
 * Documentation is available on [jsr.io](https://jsr.io/@bearz/runtime-info/doc)
 *
 * ## Usage
 * ```typescript
 * import {RUNTIME, DENO, PLATFORM, WINDOWS, EOL} from "@bearz/runtime-info";
 *
 * console.log(RUNTIME); // "deno", "bun", "node", "browser", "cloudflare", etc
 * console.log(DENO); // true, false
 * console.log(PLATFORM); // "linux", "darwin", "windows", etc
 * console.log(WINDOWS); // true, false
 * console.log(EOL); // "\r\n", "\n", etc
 * ```
 *
 * ## License
 *
 * [MIT License](./LICENSE.md)
 */

export * from "./js.ts";
export * from "./os.ts";
