// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { isNotFoundError, lstat, lstatSync, remove, removeSync, rename, renameSync, stat, statSync } from "./std.ts";
import { isSamePath, isSubdir } from "./utils.ts";
import { AlreadyExistsError, SubdirectoryMoveError } from "./errors.ts";

const EXISTS_ERROR = new AlreadyExistsError("dest already exists.");

/** Options for {@linkcode move} and {@linkcode moveSync}. */
export interface MoveOptions {
    /**
     * Whether the destination file should be overwritten if it already exists.
     *
     * @default {false}
     */
    overwrite?: boolean;
}

/**
 * Asynchronously moves a file or directory.
 *
 * @param src The source file or directory as a string or URL.
 * @param dest The destination file or directory as a string or URL.
 * @param options Options for the move operation.
 * @returns A void promise that resolves once the operation completes.
 *
 * @example Basic usage
 * ```ts
 * import { move } from "@gnome/fs";
 *
 * await move("./foo", "./bar");
 * ```
 *
 * This will move the file or directory at `./foo` to `./bar` without
 * overwriting.
 *
 * @example Overwriting
 * ```ts
 * import { move } from "@gnome/fs";
 *
 * await move("./foo", "./bar", { overwrite: true });
 * ```
 *
 * This will move the file or directory at `./foo` to `./bar`, overwriting
 * `./bar` if it already exists.
 */
export async function move(
    src: string | URL,
    dest: string | URL,
    { overwrite = false }: MoveOptions = {},
): Promise<void> {
    const srcStat = await stat(src);

    if (
        srcStat.isDirectory &&
        (isSubdir(src, dest) || isSamePath(src, dest))
    ) {
        throw new SubdirectoryMoveError(src, dest);
    }

    if (overwrite) {
        if (isSamePath(src, dest)) return;
        try {
            await remove(dest, { recursive: true });
        } catch (error) {
            if (!isNotFoundError(error)) {
                throw error;
            }
        }
    } else {
        try {
            await lstat(dest);
            return Promise.reject(EXISTS_ERROR);
        } catch {
            // Do nothing...
        }
    }

    await rename(src, dest);
}

/**
 * Synchronously moves a file or directory.
 *
 * @param src The source file or directory as a string or URL.
 * @param dest The destination file or directory as a string or URL.
 * @param options Options for the move operation.
 * @returns A void value that returns once the operation completes.
 *
 * @example Basic usage
 * ```ts
 * import { moveSync } from "@gnome/fs";
 *
 * moveSync("./foo", "./bar");
 * ```
 *
 * This will move the file or directory at `./foo` to `./bar` without
 * overwriting.
 *
 * @example Overwriting
 * ```ts
 * import { moveSync } from "@gnome/fs";
 *
 * moveSync("./foo", "./bar", { overwrite: true });
 * ```
 *
 * This will move the file or directory at `./foo` to `./bar`, overwriting
 * `./bar` if it already exists.
 */
export function moveSync(
    src: string | URL,
    dest: string | URL,
    { overwrite = false }: MoveOptions = {},
): void {
    const srcStat = statSync(src);

    if (
        srcStat.isDirectory &&
        (isSubdir(src, dest) || isSamePath(src, dest))
    ) {
        throw new SubdirectoryMoveError(src, dest);
    }

    if (overwrite) {
        if (isSamePath(src, dest)) return;
        try {
            removeSync(dest, { recursive: true });
        } catch (error) {
            if (!isNotFoundError(error)) {
                throw error;
            }
        }
    } else {
        try {
            lstatSync(dest);
            throw EXISTS_ERROR;
        } catch (error) {
            if (error === EXISTS_ERROR) {
                throw error;
            }
        }
    }

    renameSync(src, dest);
}