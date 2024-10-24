// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { isAlreadyExistsError, makeDir, makeDirSync, stat, statSync, isNotFoundError } from "./std.ts";
import { getFileInfoType } from "./utils.ts";

/**
 * Asynchronously ensures that the directory exists. If the directory structure
 * does not exist, it is created. Like `mkdir -p`.
 *
 * Requires the `--allow-read` and `--allow-write` flag when using Deno.
 *
 * @param dir The path of the directory to ensure, as a string or URL.
 * @returns A promise that resolves once the directory exists.
 *
 * @example
 * ```ts
 * import { ensureDir } from "@gnome/fs";
 *
 * await ensureDir("./bar");
 * ```
 */
export async function ensureDir(dir: string | URL) {
    try {
        const fileInfo = await stat(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(
                `Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`,
            );
        }
        return;
    } catch (err) {
        if (!isNotFoundError(err)) {
            throw err;
        }
    }
    // The dir doesn't exist. Create it.
    // This can be racy. So we catch AlreadyExists and check stat again.
    try {
        await makeDir(dir, { recursive: true });
    } catch (err) {
        if (!isAlreadyExistsError(err)) {
            throw err;
        }

        const fileInfo = await stat(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(
                `Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`,
            );
        }
    }
}
/**
 * Synchronously ensures that the directory exists. If the directory structure
 * does not exist, it is created. Like `mkdir -p`.
 *
 * Requires the `--allow-read` and `--allow-write` flag when using Deno.
 *
 * @param dir The path of the directory to ensure, as a string or URL.
 * @returns A void value that returns once the directory exists.
 *
 * @example
 * ```ts
 * import { ensureDir } from "@gnome/fs";
 *
 * await ensureDir("./bar");
 * ```
 */
export function ensureDirSync(dir: string | URL) {
    try {
        const fileInfo = statSync(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(
                `Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`,
            );
        }
        return;
    } catch (err) {
        if (!isNotFoundError(err)) {
            throw err;
        }
    }

    // The dir doesn't exist. Create it.
    // This can be racy. So we catch AlreadyExists and check stat again.
    try {
        makeDirSync(dir, { recursive: true });
    } catch (err) {
        if (!isAlreadyExistsError(err)) {
            throw err;
        }

        const fileInfo = statSync(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(
                `Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`,
            );
        }
    }
}