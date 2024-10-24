// deno-lint-ignore-file no-unused-vars
import type { SeekMode } from "../types.ts";

/**
 * The ext constant provides an extension point for adding
 * additional functionality to the file system module that
 * is not part of the standard file system interface for node
 * but is available through other modules like `fs-ext`.
 * 
 * The `fs-ext` module invokes an install script for node-gyp
 * and better to avoid taking on the dependency.
 * 
 * @example ts
 * ```ts
 * import { ext } from "@gnome/fs/node/ext";
 * import { flock, flockSync,} from "npm:fs-ext@2.0.0";
 * 
 * ext.lockFile = (fd: number, exclusive?: boolean) =>
 *     new Promise((resolve, reject) => {
 *               flock(fd, exclusive ? "ex" : "sh", (err: unknown) => {
 *                   if (err) reject(err);
 *                   resolve();
 *               });
 *           });
 *
 *       ext.lockFileSync = (fd: number, exclusive?: boolean) => {
 *           flockSync(fd, exclusive ? "ex" : "sh");
 *       };
 * 
 * ```
 */
export const ext = {
    lockFile(fd: number, exclusive?: boolean): Promise<void> {
        return Promise.reject(new Error("Not implemented"))
    },
    lockFileSync(fd: number, exclusive?: boolean): void {
        throw new Error("Not implemented");
    },
    unlockFile(fd: number): Promise<void> {
        return Promise.reject(new Error("Not implemented"));
    },
    unlockFileSync(fd: number): void {
        throw new Error("Not implemented");
    },
    seekFile(fd: number, offset: number | bigint, whence?: SeekMode): Promise<number> {
        return Promise.reject(new Error("Not implemented"));
    },
    seekFileSync(fd: number, offset: number | bigint, whence?: SeekMode): number {
        throw new Error("Not implemented");
    },
};



