export interface FsError extends Error {
    code: string;
    address?: string;
    dest?: string;
    errno?: number;
}

/**  */
export interface DirectoryInfo {
    name: string;
    isFile: boolean;
    isDirectory: boolean;
    isSymlink: boolean;
}

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

export interface WriteOptions {
    append?: boolean;
    create?: boolean;
    signal?: AbortSignal;
    mode?: number;
}

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

export type SeekMode = "start" | "current" | "end";
export type FsSupports = "write" | "read" | "lock" | "seek" | "truncate";

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
    readable: ReadableStream<Uint8Array>;
    writeable: WritableStream<Uint8Array>;
    supports: FsSupports[];

    [Symbol.dispose](): void;

    [Symbol.asyncDispose](): Promise<void>;

    /**
     * Closes the file.
     */
    close(): Promise<void>;

    closeSync(): void;

    /**
     * Flushes any buffered data to the file asynchronously.
     * @returns A promise that resolves when the data is flushed.
     */
    flush(): Promise<void>;

    /**
     * Flushes any buffered data to the file synchronously.
     */
    flushSync(): void;

    /**
     * Flushes any buffered data and metadata to the file asynchronously.
     * @returns A promise that resolves when the data and metadata are flushed.
     */
    flushData(): Promise<void>;

    /**
     * Flushes any buffered data and metadata to the file synchronously.
     */
    flushDataSync(): void;

    /**
     * Locks the file for exclusive or shared access asynchronously.
     * @param exclusive - Whether to acquire an exclusive lock. Default is false (shared lock).
     * @returns A promise that resolves when the lock is acquired.
     */
    lock(exclusive?: boolean): Promise<void>;

    /**
     * Locks the file for exclusive or shared access synchronously.
     * @param exclusive - Whether to acquire an exclusive lock. Default is false (shared lock).
     */
    lockSync(exclusive?: boolean): void;

    /**
     * Reads data from the file synchronously.
     * @param p - The buffer to read the data into.
     * @returns The number of bytes read, or null if the end of the file has been reached.
     */
    readSync(p: Uint8Array): number | null;

    /**
     * Reads data from the file asynchronously.
     * @param p - The buffer to read the data into.
     * @returns A promise that resolves with the number of bytes read, or null if the end of the file has been reached.
     */
    read(p: Uint8Array): Promise<number | null>;

    /**
     * Sets the file position synchronously.
     * @param offset - The new file position.
     * @param whence - The reference position for the offset. Default is SeekWhence.Current.
     * @returns The new file position.
     */
    seekSync(offset: number | bigint, whence?: SeekMode): number;

    /**
     * Sets the file position asynchronously.
     * @param offset - The new file position.
     * @returns A promise that resolves with the new file position.
     */
    seek(offset: number | bigint, whence?: SeekMode): Promise<number>;

    /**
     * Retrieves information about the file asynchronously.
     * @returns A promise that resolves with the file information.
     */
    stat(): Promise<FileInfo>;

    /**
     * Retrieves information about the file synchronously.
     * @returns The file information.
     */
    statSync(): FileInfo;

    /**
     * Writes data to the file synchronously.
     * @param p - The buffer containing the data to write.
     * @returns The number of bytes written.
     */
    writeSync(p: Uint8Array): number;

    /**
     * Writes data to the file asynchronously.
     * @param p - The buffer containing the data to write.
     * @returns A promise that resolves with the number of bytes written.
     */
    write(p: Uint8Array): Promise<number>;

    /**
     * Unlocks the file asynchronously.
     * @returns A promise that resolves when the file is unlocked.
     */
    unlock(): Promise<void>;

    /**
     * Unlocks the file synchronously.
     */
    unlockSync(): void;
}

/**
 * Represents a file system with various methods for interacting with files and directories.
 */
export interface FileSystem {
    uid(): number | null;
    gid(): number | null;

    /**
     * Changes the permissions of a file or directory asynchronously.
     * @param path - The path to the file or directory.
     * @param mode - The new permissions mode.
     * @returns A promise that resolves when the operation is complete.
     */
    chmod(path: string | URL, mode: number): Promise<void>;

    /**
     * Changes the permissions of a file or directory synchronously.
     * @param path - The path to the file or directory.
     * @param mode - The new permissions mode.
     */
    chmodSync(path: string | URL, mode: number): void;

    /**
     * Changes the owner and group of a file or directory asynchronously.
     * @param path - The path to the file or directory.
     * @param uid - The new owner user ID.
     * @param gid - The new owner group ID.
     * @returns A promise that resolves when the operation is complete.
     */
    chown(
        path: string | URL,
        uid: number,
        gid: number,
    ): Promise<void>;

    /**
     * Changes the owner and group of a file or directory synchronously.
     * @param path - The path to the file or directory.
     * @param uid - The new owner user ID.
     * @param gid - The new owner group ID.
     */
    chownSync(path: string | URL, uid: number, gid: number): void;

    /**
     * Gets the current working directory.
     * @returns The current working directory.
     */
    cwd(): string;

    /**
     * Copies a file asynchronously.
     * @param from - The path to the source file.
     * @param to - The path to the destination file.
     * @returns A promise that resolves when the operation is complete.
     */
    copyFile(
        from: string | URL,
        to: string | URL,
    ): Promise<void>;

    /**
     * Copies a file synchronously.
     * @param from - The path to the source file.
     * @param to - The path to the destination file.
     */
    copyFileSync(
        from: string | URL,
        to: string | URL,
    ): void;

    /**
     * Checks if a path is a directory asynchronously.
     * @param path - The path to check.
     * @returns A promise that resolves with a boolean indicating whether the path is a directory.
     */
    isDir(path: string | URL): Promise<boolean>;

    /**
     * Checks if a path is a directory synchronously.
     * @param path - The path to check.
     * @returns A boolean indicating whether the path is a directory.
     */
    isDirSync(path: string | URL): boolean;

    /**
     * Checks if a path is a file asynchronously.
     * @param path - The path to check.
     * @returns A promise that resolves with a boolean indicating whether the path is a file.
     */
    isFile(path: string | URL): Promise<boolean>;

    /**
     * Checks if a path is a file synchronously.
     * @param path - The path to check.
     * @returns A boolean indicating whether the path is a file.
     */
    isFileSync(path: string | URL): boolean;

    /**
     * Checks if an error indicates that a file or directory already exists.
     * @param err - The error to check.
     * @returns A boolean indicating whether the error indicates that the file or directory already exists.
     */
    isAlreadyExistsError(err: unknown): boolean;

    /**
     * Checks if an error indicates that a file or directory was not found.
     * @param err - The error to check.
     * @returns A boolean indicating whether the error indicates that the file or directory was not found.
     */
    isNotFoundError(err: unknown): boolean;

    /**
     * Creates a hard link asynchronously.
     * @param oldPath - The path to the existing file.
     * @param newPath - The path to the new link.
     * @returns A promise that resolves when the operation is complete.
     */
    link(oldPath: string | URL, newPath: string | URL): Promise<void>;

    /**
     * Creates a hard link synchronously.
     * @param oldPath - The path to the existing file.
     * @param newPath - The path to the new link.
     */
    linkSync(oldPath: string | URL, newPath: string | URL): void;

    /**
     * Gets information about a file or directory asynchronously.
     * @param path - The path to the file or directory.
     * @returns A promise that resolves with the file information.
     */
    lstat(path: string | URL): Promise<FileInfo>;

    /**
     * Gets information about a file or directory synchronously.
     * @param path - The path to the file or directory.
     * @returns The file information.
     */
    lstatSync(path: string | URL): FileInfo;

    /**
     * Creates a directory asynchronously.
     * @param path - The path to the directory.
     * @param options - The options for creating the directory (optional).
     * @returns A promise that resolves when the operation is complete.
     */
    makeDir(
        path: string | URL,
        options?: CreateDirectoryOptions | undefined,
    ): Promise<void>;

    /**
     * Creates a directory synchronously.
     * @param path - The path to the directory.
     * @param options - The options for creating the directory (optional).
     */
    makeDirSync(
        path: string | URL,
        options?: CreateDirectoryOptions | undefined,
    ): void;

    /**
     * Creates a temporary directory synchronously.
     * @param options - The options for creating the temporary directory (optional).
     * @returns The path to the created temporary directory.
     */
    makeTempDirSync(options?: MakeTempOptions): string;

    /**
     * Creates a temporary directory asynchronously.
     * @param options - The options for creating the temporary directory (optional).
     * @returns A promise that resolves with the path to the created temporary directory.
     */
    makeTempDir(options?: MakeTempOptions): Promise<string>;

    /**
     * Creates a temporary file synchronously.
     * @param options - The options for creating the temporary file (optional).
     * @returns The path to the created temporary file.
     */
    makeTempFileSync(options?: MakeTempOptions): string;

    /**
     * Creates a temporary file asynchronously.
     * @param options - The options for creating the temporary file (optional).
     * @returns A promise that resolves with the path to the created temporary file.
     */
    makeTempFile(options?: MakeTempOptions): Promise<string>;

    /**
     * Open a file and resolve to an instance of {@linkcode FsFile}. The
     * file does not need to previously exist if using the `create` or `createNew`
     * open options. The caller may have the resulting file automatically closed
     * by the runtime once it's out of scope by declaring the file variable with
     * the `using` keyword.
     *
     * ```ts
     * import { open } from "@gnome/fs"
     * using file = await open("/foo/bar.txt", { read: true, write: true });
     * // Do work with file
     * ```
     *
     * Alternatively, the caller may manually close the resource when finished with
     * it.
     *
     * ```ts
     * import { open } from "@gnome/fs"
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
     * import { openSync } from "@gnome/fs";
     * using file = openSync("/foo/bar.txt", { read: true, write: true });
     * // Do work with file
     * ```
     *
     * Alternatively, the caller may manually close the resource when finished with
     * it.
     *
     * ```ts
     * import { openSync } from "@gnome/fs";
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
     * Reads the contents of a directory asynchronously.
     * @param path - The path to the directory.
     * @returns An async iterable that yields directory information.
     */
    readDir(
        path: string | URL,
    ): AsyncIterable<DirectoryInfo>;

    /**
     * Reads the contents of a directory synchronously.
     * @param path - The path to the directory.
     * @returns An iterable that yields directory information.
     */
    readDirSync(
        path: string | URL,
    ): Iterable<DirectoryInfo>;

    /**
     * Reads the contents of a file asynchronously.
     * @param path - The path to the file.
     * @param options - The options for reading the file (optional).
     * @returns A promise that resolves with the file contents as a Uint8Array.
     */
    readFile(path: string | URL, options?: ReadOptions): Promise<Uint8Array>;

    /**
     * Reads the contents of a file synchronously.
     * @param path - The path to the file.
     * @returns The file contents as a Uint8Array.
     */
    readFileSync(path: string | URL): Uint8Array;

    /**
     * Reads the target of a symbolic link asynchronously.
     * @param path - The path to the symbolic link.
     * @returns A promise that resolves with the target path as a string.
     */
    readLink(path: string | URL): Promise<string>;

    /**
     * Reads the target of a symbolic link synchronously.
     * @param path - The path to the symbolic link.
     * @returns The target path as a string.
     */
    readLinkSync(path: string | URL): string;

    /**
     * Reads the contents of a file as text synchronously.
     * @param path - The path to the file.
     * @returns The file contents as a string.
     */
    readTextFileSync(path: string | URL): string;

    /**
     * Reads the contents of a file as text asynchronously.
     * @param path - The path to the file.
     * @param options - The options for reading the file (optional).
     * @returns A promise that resolves with the file contents as a string.
     */
    readTextFile(path: string | URL, options?: ReadOptions): Promise<string>;

    /**
     * Resolves the real path of a file or directory asynchronously.
     * @param path - The path to the file or directory.
     * @returns A promise that resolves with the real path as a string.
     */
    realPath(path: string | URL): Promise<string>;

    /**
     * Resolves the real path of a file or directory synchronously.
     * @param path - The path to the file or directory.
     * @returns The real path as a string.
     */
    realPathSync(path: string | URL): string;

    /**
     * Removes a file or directory asynchronously.
     * @param path - The path to the file or directory.
     * @param options - The options for removing the file or directory (optional).
     * @returns A promise that resolves when the operation is complete.
     */
    remove(
        path: string | URL,
        options?: RemoveOptions,
    ): Promise<void>;

    /**
     * Removes a file or directory synchronously.
     * @param path - The path to the file or directory.
     * @param options - The options for removing the file or directory (optional).
     */
    removeSync(path: string | URL, options?: RemoveOptions): void;

    /**
     * Renames a file or directory asynchronously.
     * @param oldPath - The path to the existing file or directory.
     * @param newPath - The path to the new file or directory.
     * @returns A promise that resolves when the operation is complete.
     */
    rename(
        oldPath: string | URL,
        newPath: string | URL,
    ): Promise<void>;

    /**
     * Renames a file or directory synchronously.
     * @param oldPath - The path to the existing file or directory.
     * @param newPath - The path to the new file or directory.
     */
    renameSync(oldPath: string | URL, newPath: string | URL): void;

    /**
     * Gets information about a file or directory asynchronously.
     * @param path - The path to the file or directory.
     * @returns A promise that resolves with the file information.
     */
    stat(path: string | URL): Promise<FileInfo>;

    /**
     * Gets information about a file or directory synchronously.
     * @param path - The path to the file or directory.
     * @returns The file information.
     */
    statSync(path: string | URL): FileInfo;

    /**
     * Creates a symbolic link asynchronously.
     * @param target - The path to the target file or directory.
     * @param path - The path to the symbolic link.
     * @param type - The type of the symbolic link (optional).
     * @returns A promise that resolves when the operation is complete.
     */
    symlink(
        target: string | URL,
        path: string | URL,
        type?: SymlinkOptions,
    ): Promise<void>;

    /**
     * Creates a symbolic link synchronously.
     * @param target - The path to the target file or directory.
     * @param path - The path to the symbolic link.
     * @param type - The type of the symbolic link (optional).
     */
    symlinkSync(
        target: string | URL,
        path: string | URL,
        type?: SymlinkOptions,
    ): void;

    /**
     * Writes text data to a file synchronously.
     * @param path - The path to the file.
     * @param data - The text data to write.
     * @param options - The options for writing the file (optional).
     */
    writeTextFileSync(
        path: string | URL,
        data: string,
        options?: WriteOptions,
    ): void;

    /**
     * Writes text data to a file asynchronously.
     * @param path - The path to the file.
     * @param data - The text data to write.
     * @param options - The options for writing the file (optional).
     * @returns A promise that resolves when the operation is complete.
     */
    writeTextFile(
        path: string | URL,
        data: string,
        options?: WriteOptions,
    ): Promise<void>;

    /**
     * Writes binary data to a file asynchronously.
     * @param path - The path to the file.
     * @param data - The binary data to write.
     * @param options - The options for writing the file (optional).
     * @returns A promise that resolves when the operation is complete.
     */
    writeFile(
        path: string | URL,
        data: Uint8Array | ReadableStream<Uint8Array>,
        options?: WriteOptions | undefined,
    ): Promise<void>;

    /**
     * Writes binary data to a file synchronously.
     * @param path - The path to the file.
     * @param data - The binary data to write.
     * @param options - The options for writing the file (optional).
     */
    writeFileSync(
        path: string | URL,
        data: Uint8Array,
        options?: WriteOptions | undefined,
    ): void;

    /**
     * Changes the access time and modification time of a file or directory asynchronously.
     * @param path - The path to the file or directory.
     * @param atime - The new access time.
     * @param mtime - The new modification time.
     * @returns A promise that resolves when the operation is complete.
     */
    utime(
        path: string | URL,
        atime: number | Date,
        mtime: number | Date,
    ): Promise<void>;

    /**
     * Changes the access time and modification time of a file or directory synchronously.
     * @param path - The path to the file or directory.
     * @param atime - The new access time.
     * @param mtime - The new modification time.
     */
    utimeSync(
        path: string | URL,
        atime: number | Date,
        mtime: number | Date,
    ): void;
}