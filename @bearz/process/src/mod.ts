/**
 * ## Overview
 *
 * A runtime agnostic implementation for functionality around
 * the current process.  The functionality is useful for writing
 * runtime agnostic command line applications or functions like
 * print, println, etc.
 *
 * - `stdout` -Write to the standard output stream
 *   for the current process. For the browser, console.log is used.
 * - `stderr` - Write to the standard error stream
 *   for the current process. For the browser, console.error is used.
 * - `stdin` - Wead from the standard input stream
 *   for the current process. Nothing is read in the browser.
 * - `exit` -  Set the exit code and close the current
 *   process. For the browser, this closes the window.
 * - `cwd` - Gets the current working directory.  For the brower,
 *   if window.history.state includes a url, that is returned. otherwise,
 *   windows.location.pathname is returned.
 * - `chdir` - Changes the current working directory. For the browser
 *   windows.history.pushState is used.
 * - `pushd` - Pushes the directory to history and changes the directory.
 * - `popd` - Pops the current directory and changes it to the previous directory.
 * - `pid`  - The current process id.
 * - `execPath` - The path to the executable for the current process.
 * - `args`  - The args passed to the current process without the execPath.
 *
 * ## Basic Usage
 *
 * ```ts
 * import { stdout, cwd, execPath, pid, chdir, args } from "@bearz/process"
 *
 * export function print(message: string) {
 *     stdout.writeSync(new TextDecoder().decode(message));
 * }
 *
 * export function println(message: string) {
 *     stdout.writeSync(new TextDecoder().decode(message + "\n"));
 * }
 *
 * print("test");
 * println("")
 * println(chdir("../"));
 * println(cwd());
 * println(execPath);
 * println(args.join(" "))
 *
 * ```
 *
 * [MIT License](./LICENSE.md)
 */
export * from "./args.ts";
export * from "./chdir.ts";
export * from "./cwd.ts";
export * from "./exec_path.ts";
export * from "./exit.ts";
export * from "./pid.ts";
export * from "./popd.ts";
export * from "./pushd.ts";
export * from "./streams.ts";
