import { basename, fromFileUrl, normalize, resolve, SEPARATOR } from "@std/path";
import type { FileInfo, WalkEntry } from "./types.ts";

export function toPathString(
    pathUrl: string | URL,
): string {
    return pathUrl instanceof URL ? fromFileUrl(pathUrl) : pathUrl;
}

// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// Copyright the Browserify authors. MIT License.

export type PathType = "file" | "dir" | "symlink";

/**
 * Get a human readable file type string.
 *
 * @param fileInfo A FileInfo describes a file and is returned by `stat`,
 *                 `lstat`
 */
export function getFileInfoType(fileInfo: FileInfo): PathType | undefined {
    return fileInfo.isFile
        ? "file"
        : fileInfo.isDirectory
        ? "dir"
        : fileInfo.isSymlink
        ? "symlink"
        : undefined;
}

/**
 * Test whether or not `dest` is a sub-directory of `src`
 * @param src src file path
 * @param dest dest file path
 * @param sep path separator
 */
export function isSubdir(
    src: string | URL,
    dest: string | URL,
    sep = SEPARATOR,
): boolean {
    if (src === dest) {
        return false;
    }
    src = toPathString(src);
    const srcArray = src.split(sep);
    dest = toPathString(dest);
    const destArray = dest.split(sep);
    return srcArray.every((current, i) => destArray[i] === current);
}

/**
 * Test whether `src` and `dest` resolve to the same location
 * @param src src file path
 * @param dest dest file path
 */
export function isSamePath(
    src: string | URL,
    dest: string | URL,
): boolean | void {
    src = toPathString(src);
    dest = toPathString(dest);

    return resolve(src) === resolve(dest);
}

/** Create {@linkcode WalkEntry} for the `path` synchronously. */
export function createWalkEntrySync(path: string | URL): WalkEntry {
    path = toPathString(path);
    path = normalize(path);
    const name = basename(path);
    const info = Deno.statSync(path);
    return {
        path,
        name,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink,
    };
}

/** Create {@linkcode WalkEntry} for the `path` asynchronously. */
export async function createWalkEntry(path: string | URL): Promise<WalkEntry> {
    path = toPathString(path);
    path = normalize(path);
    const name = basename(path);
    const info = await Deno.stat(path);
    return {
        path,
        name,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink,
    };
}
