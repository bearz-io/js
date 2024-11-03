// deno-lint-ignore-file no-unused-vars

import type {
    CreateDirectoryOptions,
    DirectoryInfo,
    FileInfo,
    FileSystem,
    FsSupports,
    MakeTempOptions,
    OpenOptions,
    ReadOptions,
    RemoveOptions,
    SeekMode,
    SymlinkOptions,
    WriteOptions,
} from "./types.ts";

export const fs: FileSystem = {
    /**
     * Changes the permissions of a file or directory.
     * @param path The path to the file or directory.
     * @param mode The new permissions mode.
     * @returns A promise that resolves when the operation is complete.
     */
    chmod(path: string | URL, mode: number): Promise<void> {
        return Promise.reject(new Error("Not implemented"));
    },

    /**
     * Synchronously changes the permissions of a file or directory.
     * @param path The path to the file or directory.
     * @param mode The new permissions mode.
     */
    chmodSync(path: string | URL, mode: number): void {
        throw new Error("Not implemented");
    },

    /**
     * Changes the owner and group of a file or directory.
     * @param path The path to the file or directory.
     * @param uid The new owner user ID.
     * @param gid The new owner group ID.
     * @returns A promise that resolves when the operation is complete.
     */
    chown(
        path: string | URL,
        uid: number,
        gid: number,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously changes the owner and group of a file or directory.
     * @param path The path to the file or directory.
     * @param uid The new owner user ID.
     * @param gid The new owner group ID.
     */
    chownSync(path: string | URL, uid: number, gid: number): void {
        throw new Error("Not implemented");
    },

    /**
     * Copies a file.
     * @param from The path to the source file.
     * @param to The path to the destination file.
     * @returns A promise that resolves when the operation is complete.
     */
    copyFile(
        from: string | URL,
        to: string | URL,
    ): Promise<void> {
        return Promise.reject(new Error("Not implemented"));
    },

    /**
     * Synchronously copies a file.
     * @param from The path to the source file.
     * @param to The path to the destination file.
     */
    copyFileSync(
        from: string | URL,
        to: string | URL,
    ): void {
        throw new Error("Not implemented");
    },

    /**
     * Gets the current working directory.
     * @returns The current working directory.
     */
    cwd(): string {
        return "";
    },

    /**
     * Gets the current group id on POSIX platforms.
     * Returns `null` on Windows.
     */
    gid(): number | null {
        return null;
    },

    /**
     * Checks if an error indicates that a file or directory already exists.
     * @param err The error to check.
     * @returns A boolean indicating whether the error indicates that the file or directory already exists.
     */
    isAlreadyExistsError(err: unknown): boolean {
        return false;
    },

    /**
     * Checks if a path is a directory.
     * @param path The path to check.
     * @returns A promise that resolves with a boolean indicating whether the path is a directory.
     */
    isDir(path: string | URL): Promise<boolean> {
        return Promise.reject(new Error("Not implemented"));
    },

    /**
     * Synchronously checks if a path is a directory.
     * @param path The path to check.
     * @returns A boolean indicating whether the path is a directory.
     */
    isDirSync(path: string | URL): boolean {
        throw new Error("Not implemented");
    },

    /**
     * Checks if a path is a file.
     * @param path The path to check.
     * @returns A promise that resolves with a boolean indicating whether the path is a file.
     */
    isFile(path: string | URL): Promise<boolean> {
        return Promise.reject(new Error("Not implemented"));
    },

    /**
     * Synchronously checks if a path is a file.
     * @param path The path to check.
     * @returns A boolean indicating whether the path is a file.
     */
    isFileSync(path: string | URL): boolean {
        throw new Error("Not implemented");
    },

    /**
     * Checks if an error indicates that a file or directory was not found.
     * @param err The error to check.
     * @returns A boolean indicating whether the error indicates that the file or directory was not found.
     */
    isNotFoundError(err: unknown): boolean {
        return false;
    },

    /**
     * Creates a hard link.
     * @param oldPath The path to the existing file.
     * @param newPath The path to the new link.
     * @returns A promise that resolves when the operation is complete.
     */
    link(oldPath: string | URL, newPath: string | URL): Promise<void> {
        return Promise.reject(new Error("Not implemented"));
    },

    /**
     * Synchronously creates a hard link.
     * @param oldPath The path to the existing file.
     * @param newPath The path to the new link.
     */
    linkSync(oldPath: string | URL, newPath: string | URL): void {
        throw new Error("Not implemented");
    },

    /**
     * Gets information about a file or directory.
     * @param path The path to the file or directory.
     * @returns A promise that resolves with the file information.
     */
    lstat(path: string | URL): Promise<FileInfo> {
        throw new Error("Not implemented");
    },
    /**
     * Gets information about a file or directory synchronously.
     * @param path The path to the file or directory.
     * @returns The file information.
     */
    lstatSync(path: string | URL): FileInfo {
        throw new Error("Not implemented");
    },

    /**
     * Creates a directory.
     * @param path The path to the directory.
     * @param options The options for creating the directory (optional).
     * @returns A promise that resolves when the operation is complete.
     */
    makeDir(
        path: string | URL,
        options?: CreateDirectoryOptions | undefined,
    ): Promise<void> {
        return Promise.reject(new Error("Not implemented"));
    },

    /**
     * Creates a directory synchronously.
     * @param path The path to the directory.
     * @param options The options for creating the directory (optional).
     */
    makeDirSync(
        path: string | URL,
        options?: CreateDirectoryOptions | undefined,
    ): void {
        throw new Error("Not implemented");
    },

    /**
     * Creates a temporary directory.
     * @param options The options for creating the temporary directory (optional).
     * @returns A promise that resolves with the path to the created temporary directory.
     */
    makeTempDir(options?: MakeTempOptions): Promise<string> {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously creates a temporary directory.
     * @param options The options for creating the temporary directory (optional).
     * @returns The path to the created temporary directory.
     */
    makeTempDirSync(options?: MakeTempOptions): string {
        throw new Error("Not implemented");
    },

    /**
     * Creates a temporary file.
     * @param options The options for creating the temporary file (optional).
     * @returns A promise that resolves with the path to the created temporary file.
     */
    makeTempFile(options?: MakeTempOptions): Promise<string> {
        return Promise.reject(new Error("Not implemented"));
    },

    /**
     * Creates a temporary file synchronously.
     * @param options The options for creating the temporary file (optional).
     * @returns The path to the created temporary file.
     */
    makeTempFileSync(options?: MakeTempOptions): string {
        throw new Error("Not implemented");
    },

    /**
     * Open a file and resolve to an instance of {@linkcode FsFile}. The
     * file does not need to previously exist if using the `create` or `createNew`
     * open options. The caller may have the resulting file automatically closed
     * by the runtime once it's out of scope by declaring the file variable with
     * the `using` keyword.
     *
     * ```ts
     * import { open } from "@bearz/fs"
     * using file = await open("/foo/bar.txt", { read: true, write: true });
     * // Do work with file
     * ```
     *
     * Alternatively, the caller may manually close the resource when finished with
     * it.
     *
     * ```ts
     * import { open } from "@bearz/fs"
     * const file = await open("/foo/bar.txt", { read: true, write: true });
     * // Do work with file
     * file.close();
     * ```
     *
     * Requires `allow-read` and/or `allow-write` permissions depending on
     * options.
     *
     * @tags allow-read, allow-write
     * @category File System
     */
    open(path: string | URL, options: OpenOptions): Promise<FsFile> {
        return Promise.reject(new Error("Not implemented"));
    },

    /**
     * Synchronously open a file and return an instance of
     * {@linkcode Deno.FsFile}. The file does not need to previously exist if
     * using the `create` or `createNew` open options. The caller may have the
     * resulting file automatically closed by the runtime once it's out of scope
     * by declaring the file variable with the `using` keyword.
     *
     * ```ts
     * import { openSync } from "@bearz/fs";
     * using file = openSync("/foo/bar.txt", { read: true, write: true });
     * // Do work with file
     * ```
     *
     * Alternatively, the caller may manually close the resource when finished with
     * it.
     *
     * ```ts
     * import { openSync } from "@bearz/fs";
     * const file = openSync("/foo/bar.txt", { read: true, write: true });
     * // Do work with file
     * file.close();
     * ```
     *
     * Requires `allow-read` and/or `allow-write` permissions depending on
     * options.
     *
     * @tags allow-read, allow-write
     * @category File System
     */
    openSync(path: string | URL, options: OpenOptions): FsFile {
        throw new Error("Not implemented");
    },

    /**
     * Reads the contents of a directory.
     * @param path The path to the directory.
     * @returns An async iterable that yields directory information.
     */
    readDir(
        path: string | URL,
    ): AsyncIterable<DirectoryInfo> {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously reads the contents of a directory.
     * @param path The path to the directory.
     * @returns An iterable that yields directory information.
     */
    readDirSync(
        path: string | URL,
    ): Iterable<DirectoryInfo> {
        throw new Error("Not implemented");
    },

    /**
     * Reads the contents of a file.
     * @param path The path to the file.
     * @param options The options for reading the file (optional).
     * @returns A promise that resolves with the file contents as a Uint8Array.
     */
    readFile(path: string | URL, options?: ReadOptions): Promise<Uint8Array> {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously reads the contents of a file.
     * @param path The path to the file.
     * @returns The file contents as a Uint8Array.
     */
    readFileSync(path: string | URL): Uint8Array {
        throw new Error("Not implemented");
    },

    /**
     * Reads the target of a symbolic link.
     * @param path The path to the symbolic link.
     * @returns A promise that resolves with the target path as a string.
     */
    readLink(path: string | URL): Promise<string> {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously reads the target of a symbolic link.
     * @param path The path to the symbolic link.
     * @returns The target path as a string.
     */
    readLinkSync(path: string | URL): string {
        throw new Error("Not implemented");
    },

    /**
     * Reads the contents of a file as text.
     * @param path The path to the file.
     * @param options The options for reading the file (optional).
     * @returns A promise that resolves with the file contents as a string.
     */
    readTextFile(path: string | URL, options?: ReadOptions): Promise<string> {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously Reads the contents of a file as text.
     * @param path The path to the file.
     * @returns The file contents as a string.
     */
    readTextFileSync(path: string | URL): string {
        throw new Error("Not implemented");
    },

    /**
     * Resolves the real path of a file or directory.
     * @param path The path to the file or directory.
     * @returns A promise that resolves with the real path as a string.
     */
    realPath(path: string | URL): Promise<string> {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously resolves the real path of a file or directory.
     * @param path The path to the file or directory.
     * @returns The real path as a string.
     */
    realPathSync(path: string | URL): string {
        throw new Error("Not implemented");
    },

    /**
     * Removes a file or directory.
     * @param path The path to the file or directory.
     * @param options The options for removing the file or directory (optional).
     * @returns A promise that resolves when the operation is complete.
     */
    remove(
        path: string | URL,
        options?: RemoveOptions,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously removes a file or directory.
     * @param path The path to the file or directory.
     * @param options The options for removing the file or directory (optional).
     */
    removeSync(path: string | URL, options?: RemoveOptions): void {
        throw new Error("Not implemented");
    },

    /**
     * Renames a file or directory.
     * @param oldPath The path to the existing file or directory.
     * @param newPath The path to the new file or directory.
     * @returns A promise that resolves when the operation is complete.
     */
    rename(
        oldPath: string | URL,
        newPath: string | URL,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously renames a file or directory.
     * @param oldPath The path to the existing file or directory.
     * @param newPath The path to the new file or directory.
     */
    renameSync(oldPath: string | URL, newPath: string | URL): void {
        throw new Error("Not implemented");
    },

    /**
     * Gets information about a file or directory.
     * @param path The path to the file or directory.
     * @returns A promise that resolves with the file information.
     */
    stat(path: string | URL): Promise<FileInfo> {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously gets information about a file or directory.
     * @param path The path to the file or directory.
     * @returns The file information.
     */
    statSync(path: string | URL): FileInfo {
        throw new Error("Not implemented");
    },

    /**
     * Creates a symbolic link.
     * @param target The path to the target file or directory.
     * @param path The path to the symbolic link.
     * @param type The type of the symbolic link (optional).
     * @returns A promise that resolves when the operation is complete.
     */
    symlink(
        target: string | URL,
        path: string | URL,
        type?: SymlinkOptions,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously creates a symbolic link.
     * @param target The path to the target file or directory.
     * @param path The path to the symbolic link.
     * @param type The type of the symbolic link (optional).
     */
    symlinkSync(
        target: string | URL,
        path: string | URL,
        type?: SymlinkOptions,
    ): void {
        throw new Error("Not implemented");
    },

    /**
     * Writes text data to a file.
     * @param path The path to the file.
     * @param data The text data to write.
     * @param options The options for writing the file (optional).
     * @returns A promise that resolves when the operation is complete.
     */
    writeTextFileSync(
        path: string | URL,
        data: string,
        options?: WriteOptions,
    ): void {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously writes text data to a file.
     * @param path The path to the file.
     * @param data The text data to write.
     * @param options The options for writing the file (optional).
     */
    writeTextFile(
        path: string | URL,
        data: string,
        options?: WriteOptions,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

    /**
     * Writes binary data to a file.
     * @param path The path to the file.
     * @param data The binary data to write.
     * @param options The options for writing the file (optional).
     * @returns A promise that resolves when the operation is complete.
     */
    writeFile(
        path: string | URL,
        data: Uint8Array | ReadableStream<Uint8Array>,
        options?: WriteOptions | undefined,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously writes binary data to a file.
     * @param path The path to the file.
     * @param data The binary data to write.
     * @param options The options for writing the file (optional).
     */
    writeFileSync(
        path: string | URL,
        data: Uint8Array,
        options?: WriteOptions | undefined,
    ): void {
        throw new Error("Not implemented");
    },

    /**
     * Gets the current user id on POSIX platforms.
     * Returns `null` on Windows.
     */
    uid(): number | null {
        return null;
    },

    /**
     * Changes the access time and modification time of a file or directory.
     * @param path The path to the file or directory.
     * @param atime The new access time.
     * @param mtime The new modification time.
     * @returns A promise that resolves when the operation is complete.
     */
    utime(
        path: string | URL,
        atime: number | Date,
        mtime: number | Date,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

    /**
     * Synchronously changes the access time and modification time of a file or directory.
     * @param path The path to the file or directory.
     * @param atime The new access time.
     * @param mtime The new modification time.
     */
    utimeSync(
        path: string | URL,
        atime: number | Date,
        mtime: number | Date,
    ): void {
        throw new Error("Not implemented");
    },
};

export abstract class FsFile {
    [key: string]: unknown;

    /**
     * The readable stream for the file.
     */
    get readable(): ReadableStream<Uint8Array> {
        throw new Error("Not implemented");
    }

    /**
     * The writeable stream for the file.
     */
    get writeable(): WritableStream<Uint8Array> {
        throw new Error("Not implemented");
    }

    /**
     * Provides information about the file system support for the file.
     */
    get supports(): FsSupports[] {
        return [];
    }

    /**
     * Synchronously dispose of the file.
     */
    [Symbol.dispose](): void {
        return this.closeSync();
    }

    /**
     * Dispose of the file.
     * @returns A promise that resolves when the file is disposed.
     */
    [Symbol.asyncDispose](): Promise<void> {
        return this.close();
    }

    /**
     * Closes the file.
     * @returns A promise that resolves when the file is closed.
     */
    close(): Promise<void> {
        throw new Error("Not implemented");
    }

    /**
     * Synchronously closes the file.
     */
    closeSync(): void {
        throw new Error("Not implemented");
    }

    /**
     * Flushes any pending data and metadata operations
     * of the given file stream to disk.
     * @returns A promise that resolves when the data is flushed.
     */
    flush(): Promise<void> {
        throw new Error("Not implemented");
    }

    /**
     * Synchronously flushes any pending data and metadata operations
     * of the given file stream to disk.
     */
    flushSync(): void {
        throw new Error("Not implemented");
    }

    /**
     * Flushes any pending data operations of
     * the given file stream to disk.
     * @returns A promise that resolves when the data is flushed.
     */
    flushData(): Promise<void> {
        throw new Error("Not implemented");
    }

    /**
     * Synchronously flushes any pending data operations of
     * the given file stream to disk.
     * @returns
     */
    flushDataSync(): void {
        throw new Error("Not implemented");
    }

    /**
     * Acquire an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @param exclusive Acquire an exclusive lock.
     * @returns A promise that resolves when the lock is acquired.
     * @throws An error when not impelemented.
     */
    lock(exclusive?: boolean | undefined): Promise<void> {
        throw new Error("Not implemented");
    }

    /**
     * Synchronously acquire an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @param exclusive Acquire an exclusive lock.
     * @returns A promise that resolves when the lock is acquired.
     * @throws An error when not impelemented.
     */
    lockSync(exclusive?: boolean | undefined): void {
        throw new Error("Not implemented");
    }

    /**
     * Synchronously read from the file into an array buffer (`buffer`).
     *
     * Returns either the number of bytes read during the operation
     * or EOF (`null`) if there was nothing more to read.
     *
     * It is possible for a read to successfully return with `0`
     * bytes read. This does not indicate EOF.
     *
     * It is not guaranteed that the full buffer will be read in
     * a single call.
     * @param buffer The buffer to read into.
     * @returns The number of bytes read or `null` if EOF.
     */
    readSync(buffer: Uint8Array): number | null {
        throw new Error("Not implemented");
    }

    /**
     * Read from the file into an array buffer (`buffer`).
     *
     * Returns either the number of bytes read during the operation
     * or EOF (`null`) if there was nothing more to read.
     *
     * It is possible for a read to successfully return with `0`
     * bytes read. This does not indicate EOF.
     *
     * It is not guaranteed that the full buffer will be read in
     * a single call.
     * @param buffer The buffer to read into.
     * @returns A promise of the number of bytes read or `null` if EOF.
     */
    read(buffer: Uint8Array): Promise<number | null> {
        throw new Error("Not implemented");
    }

    /**
     * Synchronously seek to the given `offset` under mode given by `whence`. The
     * call resolves to the new position within the resource
     * (bytes from the start).
     *
     * **The runtime may not support this operation or may require
     * implementation of the `seek` method.**
     * @param offset The offset to seek to.
     * @param whence The `start`, `current`, or `end` of the steam.
     * @returns The new position within the resource.
     */
    seek(offset: number | bigint, whence?: SeekMode | undefined): Promise<number> {
        throw new Error("Not implemented");
    }

    /**
     * Seek to the given `offset` under mode given by `whence`. The
     * call resolves to the new position within the resource
     * (bytes from the start).
     *
     * **The runtime may not support this operation or may require
     * implementation of the `seek` method.**
     * @param offset The offset to seek to.
     * @param whence The `start`, `current`, or `end` of the steam.
     * @returns The new position within the resource.
     * @throws An error when not impelemented.
     */
    seekSync(offset: number | bigint, whence?: SeekMode): number {
        throw new Error("Not implemented");
    }

    /**
     * Gets the file information for the file.
     * @returns A file information object.
     * @throws An error if the file information cannot be retrieved.
     */
    stat(): Promise<FileInfo> {
        throw new Error("Not implemented");
    }

    /**
     * Synchronously gets the file information for the file.
     * @returns A file information object.
     * @throws An error if the file information cannot be retrieved.
     */
    statSync(): FileInfo {
        throw new Error("Not implemented");
    }

    /**
     * Synchronously write the contents of the array buffer (`buffer`)
     * to the file.
     *
     * Returns the number of bytes written.
     *
     * **It is not guaranteed that the full buffer
     * will be written in a single call.**
     * @param buffer The buffer to write.
     * @returns A promise of the number of bytes written.
     */
    writeSync(buffer: Uint8Array): number {
        throw new Error("Not implemented");
    }

    /**
     * Synchronously write the contents of the array buffer (`buffer`)
     * to the file.
     *
     * Returns the number of bytes written.
     *
     * **It is not guaranteed that the full buffer
     * will be written in a single call.**
     * @param buffer The buffer to write.
     * @returns A promise of the number of bytes written.
     */
    write(buffer: Uint8Array): Promise<number> {
        throw new Error("Not implemented");
    }

    /**
     * Release an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @returns A promise that resolves when the lock is released.
     * @throws An error if not implemented.
     */
    unlock(): Promise<void> {
        throw new Error("Not implemented");
    }

    /**
     * Release an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @throws An error if not implemented.
     */
    unlockSync(): void {
        throw new Error("Not implemented");
    }
}
