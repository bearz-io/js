import type { ExistsOptions } from "./types.ts";
import { gid, stat, uid } from "./std.ts";
import { WINDOWS } from "@bearz/runtime-info/os";

// deno-lint-ignore no-explicit-any
const g = globalThis as any;

/**
 * Asynchronously test whether or not the given path exists by checking with
 * the file system.
 *
 * Note: Do not use this function if performing a check before another operation
 * on that file. Doing so creates a race condition. Instead, perform the actual
 * file operation directly. This function is not recommended for this use case.
 * See the recommended method below.
 *
 * @see https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use
 *
 * @param path The path to the file or directory, as a string or URL.
 * @param options Additional options for the check.
 * @returns A promise that resolves with `true` if the path exists, `false`
 * otherwise.
 *
 * @example Recommended method
 * ```ts
 * // Notice no use of exists
 * try {
 *   await Deno.remove("./foo", { recursive: true });
 * } catch (error) {
 *   if (!(error instanceof Deno.errors.NotFound)) {
 *     throw error;
 *   }
 *   // Do nothing...
 * }
 * ```
 *
 * Notice that `exists()` is not used in the above example. Doing so avoids a
 * possible race condition. See the above section for details.
 *
 * @example Basic usage
 * ```ts
 * import { exists } from "@gnome/fs";
 *
 * await exists("./exists"); // true
 * await exists("./does_not_exist"); // false
 * ```
 *
 * @example Check if a path is readable
 * ```ts
 * import { exists } from "@gnome/fs";
 *
 * await exists("./readable", { isReadable: true }); // true
 * await exists("./not_readable", { isReadable: true }); // false
 * ```
 *
 * @example Check if a path is a directory
 * ```ts
 * import { exists } from "@gnome/fs";
 *
 * await exists("./directory", { isDirectory: true }); // true
 * await exists("./file", { isDirectory: true }); // false
 * ```
 *
 * @example Check if a path is a file
 * ```ts
 * import { exists } from "@gnome/fs";
 *
 * await exists("./file", { isFile: true }); // true
 * await exists("./directory", { isFile: true }); // false
 * ```
 *
 * @example Check if a path is a readable directory
 * ```ts
 * import { exists } from "@gnome/fs";
 *
 * await exists("./readable_directory", { isReadable: true, isDirectory: true }); // true
 * await exists("./not_readable_directory", { isReadable: true, isDirectory: true }); // false
 * ```
 *
 * @example Check if a path is a readable file
 * ```ts
 * import { exists } from "@gnome/fs";
 *
 * await exists("./readable_file", { isReadable: true, isFile: true }); // true
 * await exists("./not_readable_file", { isReadable: true, isFile: true }); // false
 * ```
 */
export async function exists(
    path: string | URL,
    options?: ExistsOptions,
): Promise<boolean> {
    try {
        const fi = await stat(path);
        if (
            options &&
            (options.isReadable || options.isDirectory || options.isFile)
        ) {
            if (options.isDirectory && options.isFile) {
                throw new TypeError(
                    "ExistsOptions.options.isDirectory and ExistsOptions.options.isFile must not be true together.",
                );
            }
            if (
                (options.isDirectory && !fi.isDirectory) ||
                (options.isFile && !fi.isFile)
            ) {
                return false;
            }
            if (options.isReadable) {
                if (fi.mode === null) {
                    return true; // Exclusive on Non-POSIX systems
                }
                if (uid() === fi.uid) {
                    // User is owner and can read?
                    return (fi.mode & 0o400) === 0o400;
                } else if (gid() === fi.gid) {
                    // User group is owner and can read?
                    return (fi.mode & 0o040) === 0o040;
                }
                return (fi.mode & 0o004) === 0o004; // Others can read?
            }
        }
        return true;
    } catch (error) {
        if (g.process && error instanceof Error) {
            const { code } = error  as unknown as { code: string };

            if (code === "ENOENT") {
                return false;
            }
            if (code === "EPERM" || code === "EACCES") {
                if (WINDOWS && code === "EACCES" && (options?.isDirectory || options?.isFile)) {
                    return false; // can't determine if it's a directory or file
                }
                return !options?.isReadable;
            }
        }

        if (g.Deno) {
            if (error instanceof g.Deno.errors.NotFound) {
                return false;
            }

            if (error instanceof g.Deno.errors.PermissionDenied) {
                if ((await g.Deno.permissions.query({ name: "read", path })).state === "granted") {
                    // --allow-read not missing
                    return !options?.isReadable; // PermissionDenied was raised by file system, so the item exists, but can't be read
                }
            }
        }

        throw error;
    }
}

/**
 * Synchronously test whether or not the given path exists by checking with
 * the file system.
 *
 * Note: Do not use this function if performing a check before another operation
 * on that file. Doing so creates a race condition. Instead, perform the actual
 * file operation directly. This function is not recommended for this use case.
 * See the recommended method below.
 *
 * @see https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use
 *
 * @param path The path to the file or directory, as a string or URL.
 * @param options Additional options for the check.
 * @returns `true` if the path exists, `false` otherwise.
 *
 * @example Recommended method
 * ```ts
 * // Notice no use of exists
 * try {
 *   Deno.removeSync("./foo", { recursive: true });
 * } catch (error) {
 *   if (!(error instanceof Deno.errors.NotFound)) {
 *     throw error;
 *   }
 *   // Do nothing...
 * }
 * ```
 *
 * Notice that `existsSync()` is not used in the above example. Doing so avoids
 * a possible race condition. See the above section for details.
 *
 * @example Basic usage
 * ```ts
 * import { existsSync } from "@gnome/fs";
 *
 * existsSync("./exists"); // true
 * existsSync("./does_not_exist"); // false
 * ```
 *
 * @example Check if a path is readable
 * ```ts
 * import { existsSync } from "@gnome/fs";
 *
 * existsSync("./readable", { isReadable: true }); // true
 * existsSync("./not_readable", { isReadable: true }); // false
 * ```
 *
 * @example Check if a path is a directory
 * ```ts
 * import { existsSync } from "@gnome/fs";
 *
 * existsSync("./directory", { isDirectory: true }); // true
 * existsSync("./file", { isDirectory: true }); // false
 * ```
 *
 * @example Check if a path is a file
 * ```ts
 * import { existsSync } from "@gnome/fs";
 *
 * existsSync("./file", { isFile: true }); // true
 * existsSync("./directory", { isFile: true }); // false
 * ```
 *
 * @example Check if a path is a readable directory
 * ```ts
 * import { existsSync } from "@gnome/fs";
 *
 * existsSync("./readable_directory", { isReadable: true, isDirectory: true }); // true
 * existsSync("./not_readable_directory", { isReadable: true, isDirectory: true }); // false
 * ```
 *
 * @example Check if a path is a readable file
 * ```ts
 * import { existsSync } from "@gnome/fs";
 *
 * existsSync("./readable_file", { isReadable: true, isFile: true }); // true
 * existsSync("./not_readable_file", { isReadable: true, isFile: true }); // false
 * ```
 */
export function existsSync(
    path: string | URL,
    options?: ExistsOptions,
): boolean {
    try {
        const stat = Deno.statSync(path);
        if (
            options &&
            (options.isReadable || options.isDirectory || options.isFile)
        ) {
            if (options.isDirectory && options.isFile) {
                throw new TypeError(
                    "ExistsOptions.options.isDirectory and ExistsOptions.options.isFile must not be true together.",
                );
            }
            if (
                (options.isDirectory && !stat.isDirectory) ||
                (options.isFile && !stat.isFile)
            ) {
                return false;
            }
            if (options.isReadable) {
                if (stat.mode === null) {
                    return true; // Exclusive on Non-POSIX systems
                }
                if (uid() === stat.uid) {
                    return (stat.mode & 0o400) === 0o400; // User is owner and can read?
                } else if (gid() === stat.gid) {
                    return (stat.mode & 0o040) === 0o040; // User group is owner and can read?
                }
                return (stat.mode & 0o004) === 0o004; // Others can read?
            }
        }
        return true;
    } catch (error) {
        if (g.process && error instanceof Error) {
            const { code } = error  as unknown as { code: string };

            if (code === "ENOENT") {
                return false;
            }
            if (code === "EPERM" || code === "EACCES") {
                if (WINDOWS && code === "EACCES" && (options?.isDirectory || options?.isFile)) {
                    return false; // can't determine if it's a directory or file
                }
                return !options?.isReadable;
            }
        }
        if (g.Deno) {
            if (error instanceof Deno.errors.NotFound) {
                return false;
            }
            if (error instanceof Deno.errors.PermissionDenied) {
                if (
                    Deno.permissions.querySync({ name: "read", path }).state === "granted"
                ) {
                    // --allow-read not missing
                    return !options?.isReadable; // PermissionDenied was raised by file system, so the item exists, but can't be read
                }
            }
        }

        throw error;
    }
}