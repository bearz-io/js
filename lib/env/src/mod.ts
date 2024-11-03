/**
 * ## Overview
 *
 * The env provides a uniform way to work with environment variables and
 * the path variable across different runtimes such as bun, node, deno,
 * cloudflare workers.
 *
 * Variable expansion is included.
 *
 * ## Basic Usage
 *
 * ```typescript
 * import { env, HOME, USER } from "@bearz/env";
 *
 * // get values
 * console.log(env.get("USER") || env.get("USERNAME"));
 * console.log(env.get(USER)); // gets the os specific name for user
 * console.log(env.get(HOME)); // gets the os specific name for home
 *
 * // set variable
 * env.set("MY_VAR", "test")
 * console.log(env.get("MY_VAR"))
 *
 * // expansion
 * env.expand("${MY_VAR}"); // test
 * env.expand("${NO_VALUE:-default}"); // default
 * console.log(env.get("NO_VALUE")); // undefined
 *
 * env.expand("${NO_VALUE:=default}"); // default
 * console.log(env.get("NO_VALUE")); // default
 *
 * try {
 *     env.expand("${REQUIRED_VAR:?Environment variable REQUIRED_VAR is missing}");
 * } catch(e) {
 *     console.log(e.message); // Environment variable REQUIRED_VAR is missing
 * }
 *
 * // proxy object to allow get/set/delete similar to process.env
 * console.log(env.values.MY_VAR);
 *
 * // undefined will remove a value
 * env.merge({
 *     "VAR2": "VALUE",
 *     "MY_VAR": undefined
 * });
 *
 * env.set("MY_VAR", "test")
 * env.remove("MY_VAR");
 *
 * // append to the end of the environment path variables
 * env.path.append("/opt/test/bin");
 *
 * // prepends the path
 * env.path.prepend("/opt/test2/bin");
 * env.path.has("/opt/test2/bin");
 *
 * // removes the path. on windows this is case insensitive.
 * env.path.remove("/opt/test2/bin");
 *
 * // replaces the path.
 * env.path.replace("/opt/test/bin", "/opt/test2/bin")
 *
 * console.log(env.path.split());
 * console.log(env.path) // the full path string
 * console.log(env.path.toString()) // the full path string
 *
 * const path = env.path.get()
 *
 * // overwrites the environment's PATH variable
 * env.path.overwite(`${PATH}:/opt/test4/bin`)
 * ```
 *
 * [MIT License](./LICENSE.md)
 * @module
 */
export * from "./expand.ts";
export * from "./env.ts";
