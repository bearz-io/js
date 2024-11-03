/**
 * Contract for a file system error.
 */
export interface FsError extends Error {
    code: string;
    address?: string;
    dest?: string;
    errno?: number;
}

/**
 * Contract for directory information.
 */
export interface DirectoryInfo {
    name: string;
    isFile: boolean;
    isDirectory: boolean;
    isSymlink: boolean;
}

/**
 * Contract for a walk entry.
 */
export interface WalkEntry extends DirectoryInfo {
    /** Full path of the entry. */
    path: string;
}

/** Options for {@linkcode remove} and {@linkcode removeSync}  */
export interface RemoveOptions {
    recursive?: boolean;
}

/** Options for  {@linkcode makeDir} and {@linkcode makeDirSync}  */
export interface CreateDirectoryOptions {
    recursive?: boolean;
    mode?: number;
}

/** Options for {@linkcode exists} and {@linkcode existsSync.} */
export interface ExistsOptions {
    /**
     * When `true`, will check if the path is readable by the user as well.
     *
     * @default {false}
     */
    isReadable?: boolean;
    /**
     * When `true`, will check if the path is a directory as well. Directory
     * symlinks are included.
     *
     * @default {false}
     */
    isDirectory?: boolean;
    /**
     * When `true`, will check if the path is a file as well. File symlinks are
     * included.
     *
     * @default {false}
     */
    isFile?: boolean;
}

/**
 * Options which can be set when using {@linkcode makeTempDir},
 * {@linkcode makeTempDirSync}, {@linkcode makeTempFile}, and
 * {@linkcode makeTempFileSync}.
 *
 * @category File System */
export interface MakeTempOptions {
    /** Directory where the temporary directory should be created (defaults to
     * the env variable `TMPDIR`, or the system's default, usually `/tmp`).
     *
     * Note that if the passed `dir` is relative, the path returned by
     * `makeTempFile()` and `makeTempDir()` will also be relative. Be mindful of
     * this when changing working directory. */
    dir?: string;
    /** String that should precede the random portion of the temporary
     * directory's name. */
    prefix?: string;
    /** String that should follow the random portion of the temporary
     * directory's name. */
    suffix?: string;
}

/**
 * Options for {@linkcode writeTextFile} and {@linkcode writeTextFileSync}.
 */
export interface WriteOptions {
    append?: boolean;
    create?: boolean;
    signal?: AbortSignal;
    mode?: number;
}

/**
 * Options for {@linkcode read} and {@linkcode readSync}.
 */
export interface ReadOptions {
    /**
     * An abort signal to allow cancellation of the file read operation.
     * If the signal becomes aborted the readFile operation will be stopped
     * and the promise returned will be rejected with an AbortError.
     */
    signal?: AbortSignal;
}

/** Provides information about a file and is returned by
 * {@linkcode Deno.stat}, {@linkcode Deno.lstat}, {@linkcode Deno.statSync},
 * and {@linkcode Deno.lstatSync} or from calling `stat()` and `statSync()`
 * on an {@linkcode Deno.FsFile} instance.
 *
 * @category File System
 */
export interface FileInfo {
    /** The name of the file, including the extension.  */
    name: string;

    /** The full path of the file */
    path?: string;

    /** True if this is info for a regular file. Mutually exclusive to
     * `FileInfo.isDirectory` and `FileInfo.isSymlink`. */
    isFile: boolean;
    /** True if this is info for a regular directory. Mutually exclusive to
     * `FileInfo.isFile` and `FileInfo.isSymlink`. */
    isDirectory: boolean;
    /** True if this is info for a symlink. Mutually exclusive to
     * `FileInfo.isFile` and `FileInfo.isDirectory`. */
    isSymlink: boolean;
    /** The size of the file, in bytes. */
    size: number;
    /** The last modification time of the file. This corresponds to the `mtime`
     * field from `stat` on Linux/Mac OS and `ftLastWriteTime` on Windows. This
     * may not be available on all platforms. */
    mtime: Date | null;
    /** The last access time of the file. This corresponds to the `atime`
     * field from `stat` on Unix and `ftLastAccessTime` on Windows. This may not
     * be available on all platforms. */
    atime: Date | null;
    /** The creation time of the file. This corresponds to the `birthtime`
     * field from `stat` on Mac/BSD and `ftCreationTime` on Windows. This may
     * not be available on all platforms. */
    birthtime: Date | null;
    /** ID of the device containing the file. */
    dev: number;
    /** Inode number.
     *
     * _Linux/Mac OS only._ */
    ino: number | null;
    /** The underlying raw `st_mode` bits that contain the standard Unix
     * permissions for this file/directory.
     *
     * _Linux/Mac OS only._ */
    mode: number | null;
    /** Number of hard links pointing to this file.
     *
     * _Linux/Mac OS only._ */
    nlink: number | null;
    /** User ID of the owner of this file.
     *
     * _Linux/Mac OS only._ */
    uid: number | null;
    /** Group ID of the owner of this file.
     *
     * _Linux/Mac OS only._ */
    gid: number | null;
    /** Device ID of this file.
     *
     * _Linux/Mac OS only._ */
    rdev: number | null;
    /** Blocksize for filesystem I/O.
     *
     * _Linux/Mac OS only._ */
    blksize: number | null;
    /** Number of blocks allocated to the file, in 512-byte units.
     *
     * _Linux/Mac OS only._ */
    blocks: number | null;
    /**  True if this is info for a block device.
     *
     * _Linux/Mac OS only._ */
    isBlockDevice: boolean | null;
    /**  True if this is info for a char device.
     *
     * _Linux/Mac OS only._ */
    isCharDevice: boolean | null;
    /**  True if this is info for a fifo.
     *
     * _Linux/Mac OS only._ */
    isFifo: boolean | null;
    /**  True if this is info for a socket.
     *
     * _Linux/Mac OS only._ */
    isSocket?: boolean | null;
}

/** Options that can be used with {@linkcode symlink} and
 * {@linkcode symlinkSync}.
 *
 * @category File System */
export interface SymlinkOptions {
    /** If the symbolic link should be either a file or directory. This option
     * only applies to Windows and is ignored on other operating systems. */
    type: "file" | "dir";
}

/**
 * The mode to use when seeking a file. The mode can be one of the following:
 * - `start`: Seek from the start of the file.
 * - `current`: Seek from the current position.
 * - `end`: Seek from the end of the file.
 */
export type SeekMode = "start" | "current" | "end";
export type FsSupports = "write" | "read" | "lock" | "seek" | "truncate";

/**
 * Options that can be used with {@linkcode open} and {@linkcode openSync}.
 */
export interface OpenOptions {
    /** Sets the option for read access. This option, when `true`, means that
     * the file should be read-able if opened.
     *
     * @default {true} */
    read?: boolean;
    /** Sets the option for write access. This option, when `true`, means that
     * the file should be write-able if opened. If the file already exists,
     * any write calls on it will overwrite its contents, by default without
     * truncating it.
     *
     * @default {false} */
    write?: boolean;
    /** Sets the option for the append mode. This option, when `true`, means
     * that writes will append to a file instead of overwriting previous
     * contents.
     *
     * Note that setting `{ write: true, append: true }` has the same effect as
     * setting only `{ append: true }`.
     *
     * @default {false} */
    append?: boolean;
    /** Sets the option for truncating a previous file. If a file is
     * successfully opened with this option set it will truncate the file to `0`
     * size if it already exists. The file must be opened with write access
     * for truncate to work.
     *
     * @default {false} */
    truncate?: boolean;
    /** Sets the option to allow creating a new file, if one doesn't already
     * exist at the specified path. Requires write or append access to be
     * used.
     *
     * @default {false} */
    create?: boolean;
    /** If set to `true`, no file, directory, or symlink is allowed to exist at
     * the target location. Requires write or append access to be used. When
     * createNew is set to `true`, create and truncate are ignored.
     *
     * @default {false} */
    createNew?: boolean;
    /** Permissions to use if creating the file (defaults to `0o666`, before
     * the process's umask).
     *
     * Ignored on Windows. */
    mode?: number;
}

/**
 * Represents a file in the file system.
 */
export interface FsFile extends Record<string, unknown> {
    /**
     * The readable stream for the file.
     */
    readable: ReadableStream<Uint8Array>;
    /**
     * The writeable stream for the file.
     */
    writeable: WritableStream<Uint8Array>;

    /**
     * Provides information about the file system support for the file.
     */
    supports: FsSupports[];

    /**
     * Disposes of the file.
     */
    [Symbol.dispose](): void;

    /**
     * Disposes of the file asynchronously.
     */
    [Symbol.asyncDispose](): Promise<void>;

    /**
     * Closes the file.
     * @returns A promise that resolves when the file is closed.
     */
    close(): Promise<void>;

    /**
     * Synchronously closes the file.
     */
    closeSync(): void;

    /**
     * Flushes any pending data and metadata operations
     * of the given file stream to disk.
     * @returns A promise that resolves when the data is flushed.
     */
    flush(): Promise<void>;

    /**
     * Synchronously flushes any pending data and metadata operations
     * of the given file stream to disk.
     */
    flushSync(): void;

    /**
     * Flushes any pending data operations of
     * the given file stream to disk.
     * @returns A promise that resolves when the data is flushed.
     */
    flushData(): Promise<void>;

    /**
     * Synchronously flushes any pending data operations of
     * the given file stream to disk.
     * @returns
     */
    flushDataSync(): void;

    /**
     * Acquire an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @param exclusive Acquire an exclusive lock.
     * @returns A promise that resolves when the lock is acquired.
     * @throws An error when not impelemented.
     */
    lock(exclusive?: boolean): Promise<void>;

    /**
     * Synchronously acquire an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @param exclusive Acquire an exclusive lock.
     * @returns A promise that resolves when the lock is acquired.
     * @throws An error when not impelemented.
     */
    lockSync(exclusive?: boolean): void;

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
    readSync(buffer: Uint8Array): number | null;

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
    read(buffer: Uint8Array): Promise<number | null>;

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
    seekSync(offset: number | bigint, whence?: SeekMode): number;

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
    seek(offset: number | bigint, whence?: SeekMode): Promise<number>;

    /**
     * Gets the file information for the file.
     * @returns A file information object.
     * @throws An error if the file information cannot be retrieved.
     */
    stat(): Promise<FileInfo>;

    /**
     * Synchronously gets the file information for the file.
     * @returns A file information object.
     * @throws An error if the file information cannot be retrieved.
     */
    statSync(): FileInfo;

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
    writeSync(buffer: Uint8Array): number;

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
    write(p: Uint8Array): Promise<number>;

    /**
     * Release an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @returns A promise that resolves when the lock is released.
     * @throws An error if not implemented.
     */
    unlock(): Promise<void>;

    /**
     * Release an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @throws An error if not implemented.
     */
    unlockSync(): void;
}

/**
 * Represents a file system with various methods for interacting with files and directories.
 */
export interface FileSystem {
    /**
     * Changes the permissions of a file or directory.
     * @param path The path to the file or directory.
     * @param mode The new permissions mode.
     * @returns A promise that resolves when the operation is complete.
     */
    chmod(path: string | URL, mode: number): Promise<void>;

    /**
     * Synchronously changes the permissions of a file or directory.
     * @param path The path to the file or directory.
     * @param mode The new permissions mode.
     */
    chmodSync(path: string | URL, mode: number): void;

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
    ): Promise<void>;

    /**
     * Synchronously changes the owner and group of a file or directory.
     * @param path The path to the file or directory.
     * @param uid The new owner user ID.
     * @param gid The new owner group ID.
     */
    chownSync(path: string | URL, uid: number, gid: number): void;

    /**
     * Copies a file.
     * @param from The path to the source file.
     * @param to The path to the destination file.
     * @returns A promise that resolves when the operation is complete.
     */
    copyFile(
        from: string | URL,
        to: string | URL,
    ): Promise<void>;

    /**
     * Synchronously copies a file.
     * @param from The path to the source file.
     * @param to The path to the destination file.
     */
    copyFileSync(
        from: string | URL,
        to: string | URL,
    ): void;

    /**
     * Gets the current working directory.
     * @returns The current working directory.
     */
    cwd(): string;

    /**
     * Gets the current group id on POSIX platforms.
     * Returns `null` on Windows.
     */
    gid(): number | null;

    /**
     * Checks if an error indicates that a file or directory already exists.
     * @param err The error to check.
     * @returns A boolean indicating whether the error indicates that the file or directory already exists.
     */
    isAlreadyExistsError(err: unknown): boolean;

    /**
     * Checks if a path is a directory.
     * @param path The path to check.
     * @returns A promise that resolves with a boolean indicating whether the path is a directory.
     */
    isDir(path: string | URL): Promise<boolean>;

    /**
     * Synchronously checks if a path is a directory.
     * @param path The path to check.
     * @returns A boolean indicating whether the path is a directory.
     */
    isDirSync(path: string | URL): boolean;

    /**
     * Checks if a path is a file.
     * @param path The path to check.
     * @returns A promise that resolves with a boolean indicating whether the path is a file.
     */
    isFile(path: string | URL): Promise<boolean>;

    /**
     * Synchronously checks if a path is a file.
     * @param path The path to check.
     * @returns A boolean indicating whether the path is a file.
     */
    isFileSync(path: string | URL): boolean;

    /**
     * Checks if an error indicates that a file or directory was not found.
     * @param err The error to check.
     * @returns A boolean indicating whether the error indicates that the file or directory was not found.
     */
    isNotFoundError(err: unknown): boolean;

    /**
     * Creates a hard link.
     * @param oldPath The path to the existing file.
     * @param newPath The path to the new link.
     * @returns A promise that resolves when the operation is complete.
     */
    link(oldPath: string | URL, newPath: string | URL): Promise<void>;

    /**
     * Synchronously creates a hard link.
     * @param oldPath The path to the existing file.
     * @param newPath The path to the new link.
     */
    linkSync(oldPath: string | URL, newPath: string | URL): void;

    /**
     * Gets information about a file or directory.
     * @param path The path to the file or directory.
     * @returns A promise that resolves with the file information.
     */
    lstat(path: string | URL): Promise<FileInfo>;

    /**
     * Gets information about a file or directory synchronously.
     * @param path The path to the file or directory.
     * @returns The file information.
     */
    lstatSync(path: string | URL): FileInfo;

    /**
     * Creates a directory.
     * @param path The path to the directory.
     * @param options The options for creating the directory (optional).
     * @returns A promise that resolves when the operation is complete.
     */
    makeDir(
        path: string | URL,
        options?: CreateDirectoryOptions | undefined,
    ): Promise<void>;

    /**
     * Creates a directory synchronously.
     * @param path The path to the directory.
     * @param options The options for creating the directory (optional).
     */
    makeDirSync(
        path: string | URL,
        options?: CreateDirectoryOptions | undefined,
    ): void;

    /**
     * Creates a temporary directory.
     * @param options The options for creating the temporary directory (optional).
     * @returns A promise that resolves with the path to the created temporary directory.
     */
    makeTempDir(options?: MakeTempOptions): Promise<string>;

    /**
     * Synchronously creates a temporary directory.
     * @param options The options for creating the temporary directory (optional).
     * @returns The path to the created temporary directory.
     */
    makeTempDirSync(options?: MakeTempOptions): string;

    /**
     * Creates a temporary file.
     * @param options The options for creating the temporary file (optional).
     * @returns A promise that resolves with the path to the created temporary file.
     */
    makeTempFile(options?: MakeTempOptions): Promise<string>;

    /**
     * Creates a temporary file synchronously.
     * @param options The options for creating the temporary file (optional).
     * @returns The path to the created temporary file.
     */
    makeTempFileSync(options?: MakeTempOptions): string;

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
    open(path: string | URL, option?: OpenOptions): Promise<FsFile>;

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
    openSync(path: string | URL, options?: OpenOptions): FsFile;

    /**
     * Reads the contents of a directory.
     * @param path The path to the directory.
     * @returns An async iterable that yields directory information.
     */
    readDir(
        path: string | URL,
    ): AsyncIterable<DirectoryInfo>;

    /**
     * Synchronously reads the contents of a directory.
     * @param path The path to the directory.
     * @returns An iterable that yields directory information.
     */
    readDirSync(
        path: string | URL,
    ): Iterable<DirectoryInfo>;

    /**
     * Reads the contents of a file.
     * @param path The path to the file.
     * @param options The options for reading the file (optional).
     * @returns A promise that resolves with the file contents as a Uint8Array.
     */
    readFile(path: string | URL, options?: ReadOptions): Promise<Uint8Array>;

    /**
     * Synchronously reads the contents of a file.
     * @param path The path to the file.
     * @returns The file contents as a Uint8Array.
     */
    readFileSync(path: string | URL): Uint8Array;

    /**
     * Reads the target of a symbolic link.
     * @param path The path to the symbolic link.
     * @returns A promise that resolves with the target path as a string.
     */
    readLink(path: string | URL): Promise<string>;

    /**
     * Synchronously reads the target of a symbolic link.
     * @param path The path to the symbolic link.
     * @returns The target path as a string.
     */
    readLinkSync(path: string | URL): string;

    /**
     * Reads the contents of a file as text.
     * @param path The path to the file.
     * @param options The options for reading the file (optional).
     * @returns A promise that resolves with the file contents as a string.
     */
    readTextFile(path: string | URL, options?: ReadOptions): Promise<string>;

    /**
     * Synchronously Reads the contents of a file as text.
     * @param path The path to the file.
     * @returns The file contents as a string.
     */
    readTextFileSync(path: string | URL): string;

    /**
     * Resolves the real path of a file or directory.
     * @param path The path to the file or directory.
     * @returns A promise that resolves with the real path as a string.
     */
    realPath(path: string | URL): Promise<string>;

    /**
     * Synchronously resolves the real path of a file or directory.
     * @param path The path to the file or directory.
     * @returns The real path as a string.
     */
    realPathSync(path: string | URL): string;

    /**
     * Removes a file or directory.
     * @param path The path to the file or directory.
     * @param options The options for removing the file or directory (optional).
     * @returns A promise that resolves when the operation is complete.
     */
    remove(
        path: string | URL,
        options?: RemoveOptions,
    ): Promise<void>;

    /**
     * Synchronously removes a file or directory.
     * @param path The path to the file or directory.
     * @param options The options for removing the file or directory (optional).
     */
    removeSync(path: string | URL, options?: RemoveOptions): void;

    /**
     * Renames a file or directory.
     * @param oldPath The path to the existing file or directory.
     * @param newPath The path to the new file or directory.
     * @returns A promise that resolves when the operation is complete.
     */
    rename(
        oldPath: string | URL,
        newPath: string | URL,
    ): Promise<void>;

    /**
     * Synchronously renames a file or directory.
     * @param oldPath The path to the existing file or directory.
     * @param newPath The path to the new file or directory.
     */
    renameSync(oldPath: string | URL, newPath: string | URL): void;

    /**
     * Gets information about a file or directory.
     * @param path The path to the file or directory.
     * @returns A promise that resolves with the file information.
     */
    stat(path: string | URL): Promise<FileInfo>;

    /**
     * Synchronously gets information about a file or directory.
     * @param path The path to the file or directory.
     * @returns The file information.
     */
    statSync(path: string | URL): FileInfo;

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
    ): Promise<void>;

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
    ): void;

    /**
     * Writes text data to a file.
     * @param path The path to the file.
     * @param data The text data to write.
     * @param options The options for writing the file (optional).
     * @returns A promise that resolves when the operation is complete.
     */
    writeTextFile(
        path: string | URL,
        data: string,
        options?: WriteOptions,
    ): Promise<void>;

    /**
     * Synchronously writes text data to a file.
     * @param path The path to the file.
     * @param data The text data to write.
     * @param options The options for writing the file (optional).
     */
    writeTextFileSync(
        path: string | URL,
        data: string,
        options?: WriteOptions,
    ): void;

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
    ): Promise<void>;

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
    ): void;

    /**
     * Gets the current user id on POSIX platforms.
     * Returns `null` on Windows.
     */
    uid(): number | null;

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
    ): Promise<void>;

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
    ): void;
}
