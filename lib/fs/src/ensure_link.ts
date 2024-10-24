// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { dirname } from "@std/path";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { toPathString } from "./utils.ts";
import { link, linkSync } from "./std.ts";

/**
 * Asynchronously ensures that the hard link exists. If the directory structure
 * does not exist, it is created.
 *
 * @param src The source file path as a string or URL. Directory hard links are
 * not allowed.
 * @param dest The destination link path as a string or URL.
 * @returns A void promise that resolves once the hard link exists.
 *
 * @example
 * ```ts
 * import { ensureLink } from "@gnome/fs";
 *
 * await ensureLink("./folder/targetFile.dat", "./folder/targetFile.link.dat");
 * ```
 */
export async function ensureLink(src: string | URL, dest: string | URL) {
    dest = toPathString(dest);
    await ensureDir(dirname(dest));

    await link(toPathString(src), dest);
}

/**
 * Synchronously ensures that the hard link exists. If the directory structure
 * does not exist, it is created.
 *
 * @param src The source file path as a string or URL. Directory hard links are
 * not allowed.
 * @param dest The destination link path as a string or URL.
 * @returns A void value that returns once the hard link exists.
 *
 * @example
 * ```ts
 * import { ensureLinkSync } from "@gnome/fs";
 *
 * ensureLinkSync("./folder/targetFile.dat", "./folder/targetFile.link.dat");
 * ```
 */
export function ensureLinkSync(src: string | URL, dest: string | URL) {
    dest = toPathString(dest);
    ensureDirSync(dirname(dest));

    linkSync(src, dest);
}