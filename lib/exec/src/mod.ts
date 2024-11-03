/**
 * ## Overview
 *
 * The exec module provides cross-runtime functionality for invoke
 * executables.  A unified API is created for deno, node, bun
 * to executables such as but not limited to git, which, echo, etc.
 *
 * The API is influenced by Deno's `Deno.Command` api with some ehancements
 * such as providing `which` and `whichSync` and converting string or objects
 * into an array of arguments for the excutable.
 *
 * ## Basic Usage
 *
 * ```typescript
 * import { Command, command, run, output, type SplatObject, which } from "@bearz/exec";
 *
 * // string, array, or objects can be used for "args".
 * const cmd1 = new Command("git", "show-ref master", {
 *     env: { "MY_VAR": "TEST" },
 *     cwd: "../parent"
 * });
 * const output = await cmd1.output();
 *
 * console.log(output); // ->
 * // {
 * //    code: 0,
 * //    signal: undefined,
 * //    success: true
 * //    stdout: Uint8Array([01, 12..])
 * //    stderr: Uint8Array([0])
 * // }
 *
 * // the output result has different methods on it..
 * console.log(output.text()) // text
 * console.log(output.lines()) // string[]
 * console.log(output.json()) // will throw if output is not valid json
 *
 * const cmd1 = command("git", "show-ref master");
 *
 * // these are the same.
 * console.log(await cmd1.output())
 * console.log(await cmd1);
 * console.log(await new Command("git", "show-ref master"));
 *
 * console.log(await cmd1.text()); // get only the text from stdout instead
 *
 * // pipe commands together
 * const result = await new Command("echo", ["my test"])
 *     .pipe("grep", ["test"])
 *     .pipe("cat")
 *     .output();
 *
 * console.log(result.code);
 * console.log(result.stdout);
 *
 * // output is the short hand for new Command().output()
 * // and output defaults stdout and stderr to 'piped'
 * // which returns the output as Uint8Array
 * const text = await output("git", ["show-ref", "master"]).then(o => o.text())
 * console.log(text);
 *
 * ```
 *
 * [MIT License](./LICENSE.md)
 * @module
 */
export * from "./splat.ts";
export * from "./split_arguments.ts";
export * from "./command.ts";
export * from "./which.ts";
export { setLogger } from "./set_logger.ts";
export * from "./path_finder.ts";
export * from "./errors.ts";
