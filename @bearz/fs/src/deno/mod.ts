import { basename } from "@std/path";
import { toPathString } from "../utils.ts";
import type {
    CreateDirectoryOptions,
    DirectoryInfo,
    FileInfo,
    FsSupports,
    MakeTempOptions,
    OpenOptions,
    ReadOptions,
    RemoveOptions,
    SeekMode,
    SymlinkOptions,
    WriteOptions,
} from "../types.ts";
import { fs, FsFile } from "../posix_abstractions.ts";

function translate(whence?: SeekMode): Deno.SeekMode {
    whence ??= "current";
    switch (whence) {
        case "start":
            return Deno.SeekMode.Start;
        case "current":
            return Deno.SeekMode.Current;
        case "end":
            return Deno.SeekMode.End;
        default:
            return Deno.SeekMode.Current;
    }
}

export class DenoFsFile extends FsFile {
    #file: Deno.FsFile;
    #path: string;
    #supports: FsSupports[] = [];

    constructor(file: Deno.FsFile, path: string, supports: FsSupports[] = []) {
        super();
        this.#file = file;
        this.#path = path;
        this.#supports = supports;
    }

    [key: string]: unknown;

    /**
     * The readable stream for the file.
     */
    override get readable(): ReadableStream<Uint8Array> {
        return this.#file.readable;
    }

    /**
     * The writeable stream for the file.
     */
    override get writeable(): WritableStream<Uint8Array> {
        return this.#file.writable;
    }

    /**
     * Provides information about the file system support for the file.
     */
    override get supports(): FsSupports[] {
        return this.#supports;
    }

    /**
     * Closes the file.
     * @returns A promise that resolves when the file is closed.
     */
    override close(): Promise<void> {
        return Promise.resolve(this.#file.close());
    }

    /**
     * Synchronously closes the file.
     */
    override closeSync(): void {
        this.#file.close();
    }

    /**
     * Flushes any pending data and metadata operations
     * of the given file stream to disk.
     * @returns A promise that resolves when the data is flushed.
     */
    override flush(): Promise<void> {
        return this.#file.sync();
    }

    /**
     * Synchronously flushes any pending data and metadata operations
     * of the given file stream to disk.
     */
    override flushSync(): void {
        return this.#file.syncSync();
    }

    /**
     * Flushes any pending data operations of
     * the given file stream to disk.
     * @returns A promise that resolves when the data is flushed.
     */
    override flushData(): Promise<void> {
        return this.#file.syncData();
    }

    /**
     * Synchronously flushes any pending data operations of
     * the given file stream to disk.
     * @returns
     */
    override flushDataSync(): void {
        return this.#file.syncDataSync();
    }

    /**
     * Acquire an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @param exclusive Acquire an exclusive lock.
     * @returns A promise that resolves when the lock is acquired.
     * @throws An error when not impelemented.
     */
    override lock(exclusive?: boolean | undefined): Promise<void> {
        return this.#file.lock(exclusive);
    }

    /**
     * Synchronously acquire an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @param exclusive Acquire an exclusive lock.
     * @returns A promise that resolves when the lock is acquired.
     * @throws An error when not impelemented.
     */
    override lockSync(exclusive?: boolean | undefined): void {
        return this.#file.lockSync(exclusive);
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
    override readSync(buffer: Uint8Array): number | null {
        return this.#file.readSync(buffer);
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
    override read(buffer: Uint8Array): Promise<number | null> {
        return this.#file.read(buffer);
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
    override seek(offset: number | bigint, whence?: SeekMode | undefined): Promise<number> {
        return this.#file.seek(offset, translate(whence));
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
    override seekSync(offset: number | bigint, whence?: SeekMode): number {
        return this.#file.seekSync(offset, translate(whence));
    }

    /**
     * Gets the file information for the file.
     * @returns A file information object.
     * @throws An error if the file information cannot be retrieved.
     */
    override stat(): Promise<FileInfo> {
        return this.#file.stat().then((stat) => {
            const p = this.#path;
            return {
                isFile: stat.isFile,
                isDirectory: stat.isDirectory,
                isSymlink: stat.isSymlink,
                name: basename(p),
                path: p,
                size: stat.size,
                birthtime: stat.birthtime,
                mtime: stat.mtime,
                atime: stat.atime,
                mode: stat.mode,
                uid: stat.uid,
                gid: stat.gid,
                dev: stat.dev,
                blksize: stat.blksize,
                ino: stat.ino,
                nlink: stat.nlink,
                rdev: stat.rdev,
                blocks: stat.blocks,
                isBlockDevice: stat.isBlockDevice,
                isCharDevice: stat.isCharDevice,
                isSocket: stat.isSocket,
                isFifo: stat.isFifo,
            } as FileInfo;
        });
    }

    /**
     * Synchronously gets the file information for the file.
     * @returns A file information object.
     * @throws An error if the file information cannot be retrieved.
     */
    override statSync(): FileInfo {
        const p = this.#path;
        const stat = this.#file.statSync();
        return {
            isFile: stat.isFile,
            isDirectory: stat.isDirectory,
            isSymlink: stat.isSymlink,
            name: basename(p),
            path: p,
            size: stat.size,
            birthtime: stat.birthtime,
            mtime: stat.mtime,
            atime: stat.atime,
            mode: stat.mode,
            uid: stat.uid,
            gid: stat.gid,
            dev: stat.dev,
            blksize: stat.blksize,
            ino: stat.ino,
            nlink: stat.nlink,
            rdev: stat.rdev,
            blocks: stat.blocks,
            isBlockDevice: stat.isBlockDevice,
            isCharDevice: stat.isCharDevice,
            isSocket: stat.isSocket,
            isFifo: stat.isFifo,
        } as FileInfo;
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
    override writeSync(buffer: Uint8Array): number {
        return this.#file.writeSync(buffer);
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
    override write(buffer: Uint8Array): Promise<number> {
        return this.#file.write(buffer);
    }

    /**
     * Release an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @returns A promise that resolves when the lock is released.
     * @throws An error if not implemented.
     */
    override unlock(): Promise<void> {
        return this.#file.unlock();
    }

    /**
     * Release an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @throws An error if not implemented.
     */
    override unlockSync(): void {
        this.#file.unlockSync();
    }
}

/**
 * Changes the permissions of a file or directory asynchronously.
 * @param path The path to the file or directory.
 * @param mode The new permissions mode.
 * @returns A promise that resolves when the operation is complete.
 */
fs.chmod = function (path: string | URL, mode: number): Promise<void> {
    return Deno.chmod(path, mode);
};
/**
 * Changes the permissions of a file or directory synchronously.
 * @param path The path to the file or directory.
 * @param mode The new permissions mode.
 */
fs.chmodSync = function (path: string | URL, mode: number): void {
    Deno.chmodSync(path, mode);
};

/**
 * Changes the owner and group of a file or directory asynchronously.
 * @param path The path to the file or directory.
 * @param uid The new owner user ID.
 * @param gid The new owner group ID.
 * @returns A promise that resolves when the operation is complete.
 */
fs.chown = function (
    path: string | URL,
    uid: number,
    gid: number,
): Promise<void> {
    return Deno.chown(path, uid, gid);
};

/**
 * Changes the owner and group of a file or directory synchronously.
 * @param path The path to the file or directory.
 * @param uid The new owner user ID.
 * @param gid The new owner group ID.
 */
fs.chownSync = function (path: string | URL, uid: number, gid: number): void {
    Deno.chownSync(path, uid, gid);
};

/**
 * Copies a file asynchronously.
 * @param from The path to the source file.
 * @param to The path to the destination file.
 * @returns A promise that resolves when the operation is complete.
 */
fs.copyFile = function (
    from: string | URL,
    to: string | URL,
): Promise<void> {
    return Deno.copyFile(from, to);
};

/**
 * Synchronously copies a file.
 * @param from The path to the source file.
 * @param to The path to the destination file.
 */
fs.copyFileSync = function (
    from: string | URL,
    to: string | URL,
): void {
    Deno.copyFileSync(from, to);
};

/**
 * Gets the current working directory.
 * @returns The current working directory.
 */
fs.cwd = function (): string {
    return Deno.cwd();
};

/**
 * Gets the current group id on POSIX platforms.
 * Returns `null` on Windows.
 */
fs.gid = function (): number | null {
    return Deno.gid();
};

/**
 * Checks if a path is a directory asynchronously.
 * @param path The path to check.
 * @returns A promise that resolves with a boolean indicating whether the path is a directory.
 */
fs.isDir = function (path: string | URL): Promise<boolean> {
    return Deno.stat(path)
        .then((stat) => stat.isDirectory)
        .catch(() => false);
};
/**
 * Synchronously checks if a path is a directory.
 * @param path The path to check.
 * @returns A boolean indicating whether the path is a directory.
 */
fs.isDirSync = function (path: string | URL): boolean {
    try {
        return Deno.statSync(path).isDirectory;
    } catch {
        return false;
    }
};

/**
 * Checks if a path is a file.
 * @param path The path to check.
 * @returns A promise that resolves with a boolean indicating whether the path is a file.
 */
fs.isFile = function (path: string | URL): Promise<boolean> {
    return Deno.stat(path)
        .then((stat) => stat.isFile)
        .catch(() => false);
};

/**
 * Synchronously checks if a path is a file.
 * @param path The path to check.
 * @returns A boolean indicating whether the path is a file.
 */
fs.isFileSync = function (path: string | URL): boolean {
    try {
        return Deno.statSync(path).isFile;
    } catch {
        return false;
    }
};

/**
 * Checks if an error indicates that a file or directory was not found.
 * @param err The error to check.
 * @returns A boolean indicating whether the error indicates that the file or directory was not found.
 */
fs.isNotFoundError = function (err: unknown): boolean {
    return (err instanceof Deno.errors.NotFound);
};

/**
 * Checks if an error indicates that a file or directory already exists.
 * @param err The error to check.
 * @returns A boolean indicating whether the error indicates that the file or directory already exists.
 */
fs.isAlreadyExistsError = function (err: unknown): boolean {
    return (err instanceof Deno.errors.AlreadyExists);
};

/**
 * Creates a hard link.
 * @param oldPath The path to the existing file.
 * @param newPath The path to the new link.
 * @returns A promise that resolves when the operation is complete.
 */
fs.link = function (oldPath: string | URL, newPath: string | URL): Promise<void> {
    return Deno.link(toPathString(oldPath), toPathString(newPath));
};

/**
 * Synchronously creates a hard link.
 * @param oldPath The path to the existing file.
 * @param newPath The path to the new link.
 */
fs.linkSync = function (oldPath: string | URL, newPath: string | URL): void {
    Deno.linkSync(toPathString(oldPath), toPathString(newPath));
};

/**
 * Gets information about a file or directory.
 * @param path The path to the file or directory.
 * @returns A promise that resolves with the file information.
 */
fs.lstat = function (path: string | URL): Promise<FileInfo> {
    return Deno.lstat(path).then((stat) => {
        const p = path instanceof URL ? path.toString() : path;
        return {
            isFile: stat.isFile,
            isDirectory: stat.isDirectory,
            isSymlink: stat.isSymlink,
            name: basename(p),
            path: p,
            size: stat.size,
            birthtime: stat.birthtime,
            mtime: stat.mtime,
            atime: stat.atime,
            mode: stat.mode,
            uid: stat.uid,
            gid: stat.gid,
            dev: stat.dev,
            blksize: stat.blksize,
            ino: stat.ino,
            nlink: stat.nlink,
            rdev: stat.rdev,
            blocks: stat.blocks,
            isBlockDevice: stat.isBlockDevice,
            isCharDevice: stat.isCharDevice,
            isSocket: stat.isSocket,
            isFifo: stat.isFifo,
        };
    });
};

/**
 * Gets information about a file or directory synchronously.
 * @param path The path to the file or directory.
 * @returns The file information.
 */
fs.lstatSync = function (path: string | URL): FileInfo {
    const stat = Deno.lstatSync(path);
    const p = path instanceof URL ? path.toString() : path;
    return {
        isFile: stat.isFile,
        isDirectory: stat.isDirectory,
        isSymlink: stat.isSymlink,
        name: basename(p),
        path: p,
        size: stat.size,
        birthtime: stat.birthtime,
        mtime: stat.mtime,
        atime: stat.atime,
        mode: stat.mode,
        uid: stat.uid,
        gid: stat.gid,
        dev: stat.dev,
        blksize: stat.blksize,
        ino: stat.ino,
        nlink: stat.nlink,
        rdev: stat.rdev,
        blocks: stat.blocks,
        isBlockDevice: stat.isBlockDevice,
        isCharDevice: stat.isCharDevice,
        isSocket: stat.isSocket,
        isFifo: stat.isFifo,
    };
};

/**
 * Creates a directory.
 * @param path The path to the directory.
 * @param options The options for creating the directory (optional).
 * @returns A promise that resolves when the operation is complete.
 */
fs.makeDir = function (
    path: string | URL,
    options?: CreateDirectoryOptions | undefined,
): Promise<void> {
    return Deno.mkdir(path, options);
};

/**
 * Synchronously creates a directory.
 * @param path The path to the directory.
 * @param options The options for creating the directory (optional).
 */
fs.makeDirSync = function (
    path: string | URL,
    options?: CreateDirectoryOptions | undefined,
): void {
    Deno.mkdirSync(path, options);
};

/**
 * Creates a temporary directory.
 * @param options The options for creating the temporary directory (optional).
 * @returns A promise that resolves with the path to the created temporary directory.
 */
fs.makeTempDir = function (options?: MakeTempOptions): Promise<string> {
    return Deno.makeTempDir(options);
};

/**
 * Synchronously creates a temporary directory.
 * @param options The options for creating the temporary directory (optional).
 * @returns The path to the created temporary directory.
 */
fs.makeTempDirSync = function (options?: MakeTempOptions): string {
    return Deno.makeTempDirSync(options);
};

/**
 * Creates a temporary file.
 * @param options The options for creating the temporary file (optional).
 * @returns A promise that resolves with the path to the created temporary file.
 */
fs.makeTempFile = function (options?: MakeTempOptions): Promise<string> {
    return Deno.makeTempFile(options);
};

/**
 * Creates a temporary file synchronously.
 * @param options The options for creating the temporary file (optional).
 * @returns The path to the created temporary file.
 */
fs.makeTempFileSync = function (options?: MakeTempOptions): string {
    return Deno.makeTempFileSync(options);
};

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
fs.open = async function (path: string | URL, options: OpenOptions): Promise<FsFile> {
    const file = await Deno.open(path, options);
    const p = path instanceof URL ? path.toString() : path;
    const supports: FsSupports[] = ["lock", "seek"];
    if (options.write || options.append) {
        supports.push("write");
    }

    if (options.read) {
        supports.push("read");
    }

    if (options.truncate || options.create) {
        supports.push("truncate");
    }

    return new DenoFsFile(file, p, supports);
};

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
fs.openSync = function (path: string | URL, options: OpenOptions): FsFile {
    const file = Deno.openSync(path, options);
    const p = path instanceof URL ? path.toString() : path;
    const supports: FsSupports[] = ["lock", "seek"];

    if (options.write || options.append) {
        supports.push("write");
    }

    if (options.read) {
        supports.push("read");
    }

    if (options.truncate || options.create) {
        supports.push("truncate");
    }

    return new DenoFsFile(file, p, supports);
};

/**
 * Reads the contents of a directory.
 * @param path The path to the directory.
 * @returns An async iterable that yields directory information.
 */
fs.readDir = function (
    path: string | URL,
): AsyncIterable<DirectoryInfo> {
    return Deno.readDir(path);
};

/**
 * Synchronously reads the contents of a directory.
 * @param path The path to the directory.
 * @returns An iterable that yields directory information.
 */
fs.readDirSync = function (
    path: string | URL,
): Iterable<DirectoryInfo> {
    return Deno.readDirSync(path);
};

/**
 * Reads the contents of a file.
 * @param path The path to the file.
 * @param options The options for reading the file (optional).
 * @returns A promise that resolves with the file contents as a Uint8Array.
 */
fs.readFile = function (path: string | URL, options?: ReadOptions): Promise<Uint8Array> {
    return Deno.readFile(path, options);
};

/**
 * Synchronously reads the contents of a file.
 * @param path The path to the file.
 * @returns The file contents as a Uint8Array.
 */
fs.readFileSync = function (path: string | URL): Uint8Array {
    return Deno.readFileSync(path);
};

/**
 * Reads the target of a symbolic link.
 * @param path The path to the symbolic link.
 * @returns A promise that resolves with the target path as a string.
 */
fs.readLink = function (path: string | URL): Promise<string> {
    return Deno.readLink(path);
};

/**
 * Synchronously reads the target of a symbolic link.
 * @param path The path to the symbolic link.
 * @returns The target path as a string.
 */
fs.readLinkSync = function (path: string | URL): string {
    return Deno.readLinkSync(path);
};

/**
 * Reads the contents of a file as text.
 * @param path The path to the file.
 * @param options The options for reading the file (optional).
 * @returns A promise that resolves with the file contents as a string.
 */
fs.readTextFile = function (path: string | URL, options?: ReadOptions): Promise<string> {
    return Deno.readTextFile(path, options);
};

/**
 * Synchronously Reads the contents of a file as text.
 * @param path The path to the file.
 * @returns The file contents as a string.
 */
fs.readTextFileSync = function (path: string | URL): string {
    return Deno.readTextFileSync(path);
};

/**
 * Resolves the real path of a file or directory.
 * @param path The path to the file or directory.
 * @returns A promise that resolves with the real path as a string.
 */
fs.realPath = function (path: string | URL): Promise<string> {
    return Deno.realPath(path);
};

/**
 * Synchronously resolves the real path of a file or directory.
 * @param path The path to the file or directory.
 * @returns The real path as a string.
 */
fs.realPathSync = function (path: string | URL): string {
    return Deno.realPathSync(path);
};

/**
 * Removes a file or directory.
 * @param path The path to the file or directory.
 * @param options The options for removing the file or directory (optional).
 * @returns A promise that resolves when the operation is complete.
 */
fs.remove = function (
    path: string | URL,
    options?: RemoveOptions,
): Promise<void> {
    return Deno.remove(path, options);
};

/**
 * Synchronously removes a file or directory.
 * @param path The path to the file or directory.
 * @param options The options for removing the file or directory (optional).
 */
fs.removeSync = function (path: string | URL, options?: RemoveOptions): void {
    return Deno.removeSync(path, options);
};

/**
 * Renames a file or directory.
 * @param oldPath The path to the existing file or directory.
 * @param newPath The path to the new file or directory.
 * @returns A promise that resolves when the operation is complete.
 */
fs.rename = function (
    oldPath: string | URL,
    newPath: string | URL,
): Promise<void> {
    return Deno.rename(oldPath, newPath);
};

/**
 * Synchronously renames a file or directory.
 * @param oldPath The path to the existing file or directory.
 * @param newPath The path to the new file or directory.
 */
fs.renameSync = function (oldPath: string | URL, newPath: string | URL): void {
    Deno.renameSync(oldPath, newPath);
};

/**
 * Gets information about a file or directory.
 * @param path The path to the file or directory.
 * @returns A promise that resolves with the file information.
 */
fs.stat = function (path: string | URL): Promise<FileInfo> {
    return Deno.stat(path).then((stat) => {
        const p = path instanceof URL ? path.toString() : path;
        return {
            isFile: stat.isFile,
            isDirectory: stat.isDirectory,
            isSymlink: stat.isSymlink,
            name: basename(p),
            path: p,
            size: stat.size,
            birthtime: stat.birthtime,
            mtime: stat.mtime,
            atime: stat.atime,
            mode: stat.mode,
            uid: stat.uid,
            gid: stat.gid,
            dev: stat.dev,
            blksize: stat.blksize,
            ino: stat.ino,
            nlink: stat.nlink,
            rdev: stat.rdev,
            blocks: stat.blocks,
            isBlockDevice: stat.isBlockDevice,
            isCharDevice: stat.isCharDevice,
            isSocket: stat.isSocket,
            isFifo: stat.isFifo,
        };
    });
};

/**
 * Gets information about a file or directory synchronously.
 * @param path The path to the file or directory.
 * @returns The file information.
 */
fs.statSync = function (path: string | URL): FileInfo {
    const stat = Deno.statSync(path);
    const p = path instanceof URL ? path.toString() : path;
    return {
        isFile: stat.isFile,
        isDirectory: stat.isDirectory,
        isSymlink: stat.isSymlink,
        name: basename(p),
        path: p,
        size: stat.size,
        birthtime: stat.birthtime,
        mtime: stat.mtime,
        atime: stat.atime,
        mode: stat.mode,
        uid: stat.uid,
        gid: stat.gid,
        dev: stat.dev,
        blksize: stat.blksize,
        ino: stat.ino,
        nlink: stat.nlink,
        rdev: stat.rdev,
        blocks: stat.blocks,
        isBlockDevice: stat.isBlockDevice,
        isCharDevice: stat.isCharDevice,
        isSocket: stat.isSocket,
        isFifo: stat.isFifo,
    };
};

/**
 * Creates a symbolic link.
 * @param target The path to the target file or directory.
 * @param path The path to the symbolic link.
 * @param type The type of the symbolic link (optional).
 * @returns A promise that resolves when the operation is complete.
 */
fs.symlink = function (
    target: string | URL,
    path: string | URL,
    type?: SymlinkOptions,
): Promise<void> {
    return Deno.symlink(target, path, type);
};

/**
 * Synchronously creates a symbolic link.
 * @param target The path to the target file or directory.
 * @param path The path to the symbolic link.
 * @param type The type of the symbolic link (optional).
 */
fs.symlinkSync = function (
    target: string | URL,
    path: string | URL,
    type?: SymlinkOptions,
): void {
    Deno.symlinkSync(target, path, type);
};

/**
 * Writes text data to a file.
 * @param path The path to the file.
 * @param data The text data to write.
 * @param options The options for writing the file (optional).
 * @returns A promise that resolves when the operation is complete.
 */
fs.writeTextFile = function (
    path: string | URL,
    data: string,
    options?: WriteOptions,
): Promise<void> {
    return Deno.writeTextFile(path, data, options);
};

/**
 * Synchronously writes text data to a file.
 * @param path The path to the file.
 * @param data The text data to write.
 * @param options The options for writing the file (optional).
 */
fs.writeTextFileSync = function (
    path: string | URL,
    data: string,
    options?: WriteOptions,
): void {
    Deno.writeTextFileSync(path, data, options);
};

/**
 * Writes binary data to a file.
 * @param path The path to the file.
 * @param data The binary data to write.
 * @param options The options for writing the file (optional).
 * @returns A promise that resolves when the operation is complete.
 */
fs.writeFile = function (
    path: string | URL,
    data: Uint8Array | ReadableStream<Uint8Array>,
    options?: WriteOptions | undefined,
): Promise<void> {
    return Deno.writeFile(path, data, options);
};

/**
 * Synchronously writes binary data to a file.
 * @param path The path to the file.
 * @param data The binary data to write.
 * @param options The options for writing the file (optional).
 */
fs.writeFileSync = function (
    path: string | URL,
    data: Uint8Array,
    options?: WriteOptions | undefined,
): void {
    return Deno.writeFileSync(path, data, options);
};

/**
 * Gets the current user id on POSIX platforms.
 * Returns `null` on Windows.
 */
fs.uid = function (): number | null {
    return Deno.uid();
};

/**
 * Changes the access time and modification time of a file or directory.
 * @param path The path to the file or directory.
 * @param atime The new access time.
 * @param mtime The new modification time.
 * @returns A promise that resolves when the operation is complete.
 */
fs.utime = function (
    path: string | URL,
    atime: number | Date,
    mtime: number | Date,
): Promise<void> {
    return Deno.utime(path, atime, mtime);
};

/**
 * Synchronously changes the access time and modification time of a file or directory.
 * @param path The path to the file or directory.
 * @param atime The new access time.
 * @param mtime The new modification time.
 */
fs.utimeSync = function (
    path: string | URL,
    atime: number | Date,
    mtime: number | Date,
): void {
    Deno.utimeSync(path, atime, mtime);
};
