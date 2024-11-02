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
    /**
     * Lock a file descriptor.
     * @param fd The file descriptor
     * @param exclusive The lock type
     * @returns A promise that resolves when the file is locked.
     */
    lockFile(fd: number, exclusive?: boolean): Promise<void> {
        return Promise.reject(new Error("Not implemented"));
    },

    /**
     * Synchronously lock a file descriptor.
     * @param fd The file descriptor
     * @param exclusive The lock type
     * @returns A promise that resolves when the file is locked.
     */
    lockFileSync(fd: number, exclusive?: boolean): void {
        throw new Error("Not implemented");
    },

    /**
     * Unlock a file descriptor.
     * @param fd The file descriptor
     * @returns A promise that resolves when the file is unlocked.
     */
    unlockFile(fd: number): Promise<void> {
        return Promise.reject(new Error("Not implemented"));
    },

    /**
     * Synchronously unlock a file descriptor.
     * @param fd The file descriptor
     * @returns A promise that resolves when the file is unlocked.
     */
    unlockFileSync(fd: number): void {
        throw new Error("Not implemented");
    },

    /**
     * Seek to a position in a file descriptor.
     * @param fd The file descriptor
     * @param offset The offset to seek to
     * @param whence The seek mode
     * @returns A promise that resolves with the new position.
     */
    seekFile(fd: number, offset: number | bigint, whence?: SeekMode): Promise<number> {
        return Promise.reject(new Error("Not implemented"));
    },

    /**
     * Synchronously seek to a position in a file descriptor.
     * @param fd The file descriptor
     * @param offset The offset to seek to
     * @param whence The seek mode
     * @returns The new position.
     */
    seekFileSync(fd: number, offset: number | bigint, whence?: SeekMode): number {
        throw new Error("Not implemented");
    },
};
