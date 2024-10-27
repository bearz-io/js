// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { dirname, resolve } from "@std/path";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { getFileInfoType, toPathString } from "./utils.ts";
import { isAlreadyExistsError, lstat, lstatSync, readLink, readLinkSync, symlink, symlinkSync } from "./std.ts";
import type { SymlinkOptions } from "./types.ts";
import { AlreadyExistsError } from "./errors.ts";
import { WINDOWS } from "@bearz/runtime-info/os";

function resolveSymlinkTarget(target: string | URL, linkName: string | URL) {
    if (typeof target !== "string") {
        return target; // URL is always absolute path
    }
    if (typeof linkName === "string") {
        return resolve(dirname(linkName), target);
    } else {
        return new URL(target, linkName);
    }
}

/**
 * Asynchronously ensures that the link exists, and points to a valid file. If
 * the directory structure does not exist, it is created. If the link already
 * exists, it is not modified but error is thrown if it is not point to the
 * given target.
 *
 * Requires the `--allow-read` and `--allow-write` flag when using Deno.
 *
 * @param target The source file path as a string or URL.
 * @param linkName The destination link path as a string or URL.
 * @returns A void promise that resolves once the link exists.
 *
 * @example
 * ```ts
 * import { ensureSymlink } from "@gnome/fs";
 *
 * await ensureSymlink("./folder/targetFile.dat", "./folder/targetFile.link.dat");
 * ```
 */
export async function ensureSymlink(
    target: string | URL,
    linkName: string | URL,
) {
    const targetRealPath = resolveSymlinkTarget(target, linkName);
    const srcStatInfo = await lstat(targetRealPath);
    const srcFilePathType = getFileInfoType(srcStatInfo);

    await ensureDir(dirname(toPathString(linkName)));

    const options: SymlinkOptions | undefined = WINDOWS
        ? {
            type: srcFilePathType === "dir" ? "dir" : "file",
        }
        : undefined;

    try {
        await symlink(target, linkName, options);
    } catch (error) {
        if (!(isAlreadyExistsError(error))) {
            console.log("### throwing error ####");
            console.log(error);
            console.log(error instanceof Deno.errors.AlreadyExists);
            throw error;
        }
        const linkStatInfo = await lstat(linkName);
        if (!linkStatInfo.isSymlink) {
            const type = getFileInfoType(linkStatInfo);
            throw new AlreadyExistsError(
                `A '${type}' already exists at the path: ${linkName}`,
            );
        }
        const linkPath = await readLink(linkName);
        const linkRealPath = resolve(linkPath);
        if (linkRealPath !== targetRealPath) {
            throw new AlreadyExistsError(
                `A symlink targeting to an undesired path already exists: ${linkName} -> ${linkRealPath}`,
            );
        }
    }
}

/**
 * Synchronously ensures that the link exists, and points to a valid file. If
 * the directory structure does not exist, it is created. If the link already
 * exists, it is not modified but error is thrown if it is not point to the
 * given target.
 *
 * Requires the `--allow-read` and `--allow-write` flag when using Deno.
 *
 * @param target The source file path as a string or URL.
 * @param linkName The destination link path as a string or URL.
 * @returns A void value that returns once the link exists.
 *
 * @example
 * ```ts
 * import { ensureSymlinkSync } from "@gnome/fs";
 *
 * ensureSymlinkSync("./folder/targetFile.dat", "./folder/targetFile.link.dat");
 * ```
 */
export function ensureSymlinkSync(
    target: string | URL,
    linkName: string | URL,
) {
    const targetRealPath = resolveSymlinkTarget(target, linkName);
    const srcStatInfo = lstatSync(targetRealPath);
    const srcFilePathType = getFileInfoType(srcStatInfo);

    ensureDirSync(dirname(toPathString(linkName)));

    const options: SymlinkOptions | undefined = WINDOWS
        ? {
            type: srcFilePathType === "dir" ? "dir" : "file",
        }
        : undefined;

    try {
        symlinkSync(target, linkName, options);
    } catch (error) {
        if (!(isAlreadyExistsError(error))) {
            throw error;
        }
        const linkStatInfo = lstatSync(linkName);
        if (!linkStatInfo.isSymlink) {
            const type = getFileInfoType(linkStatInfo);
            throw new AlreadyExistsError(
                `A '${type}' already exists at the path: ${linkName}`,
            );
        }
        const linkPath = readLinkSync(linkName);
        const linkRealPath = resolve(linkPath);
        if (linkRealPath !== targetRealPath) {
            throw new AlreadyExistsError(
                `A symlink targeting to an undesired path already exists: ${linkName} -> ${linkRealPath}`,
            );
        }
    }
}