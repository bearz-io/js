// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { dirname } from "@std/path";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { getFileInfoType, toPathString } from "./utils.ts";
import { lstat, lstatSync, writeFile, writeFileSync } from "./posix.ts";
import { isNotFoundError } from "./posix.ts";

/**
 * Asynchronously ensures that the file exists. If the file that is requested to
 * be created is in directories that do not exist, these directories are created.
 * If the file already exists, it is not modified.
 *
 * Requires the `--allow-read` and `--allow-write` flag when using Deno.
 *
 * @param filePath The path of the file to ensure, as a string or URL.
 * @returns A void promise that resolves once the file exists.
 *
 * @example
 * ```ts
 * import { ensureFile } from "@bearz/fs";
 *
 * await ensureFile("./folder/targetFile.dat");
 * ```
 */
export async function ensureFile(filePath: string | URL): Promise<void> {
    try {
        // if file exists
        const stat = await lstat(filePath);
        if (!stat.isFile) {
            throw new Error(
                `Ensure path exists, expected 'file', got '${getFileInfoType(stat)}'`,
            );
        }
    } catch (err) {
        // if file not exists
        if (isNotFoundError(err)) {
            // ensure dir exists
            await ensureDir(dirname(toPathString(filePath)));
            // create file
            await writeFile(filePath, new Uint8Array());
            return;
        }

        throw err;
    }
}

/**
 * Synchronously ensures that the file exists. If the file that is requested to
 * be created is in directories that do not exist, these directories are created.
 * If the file already exists, it is not modified.
 *
 * Requires the `--allow-read` and `--allow-write` flag when using Deno.
 *
 * @param filePath The path of the file to ensure, as a string or URL.
 * @returns A void value that returns once the file exists.
 *
 * @example
 * ```ts
 * import { ensureFileSync } from "@bearz/fs";
 *
 * ensureFileSync("./folder/targetFile.dat");
 * ```
 */
export function ensureFileSync(filePath: string | URL): void {
    try {
        // if file exists
        const stat = lstatSync(filePath);
        if (!stat.isFile) {
            throw new Error(
                `Ensure path exists, expected 'file', got '${getFileInfoType(stat)}'`,
            );
        }
    } catch (err) {
        // if file not exists
        if (isNotFoundError(err)) {
            // ensure dir exists
            ensureDirSync(dirname(toPathString(filePath)));
            // create file
            writeFileSync(filePath, new Uint8Array());
            return;
        }
        throw err;
    }
}
