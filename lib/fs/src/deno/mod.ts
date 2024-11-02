import { basename } from "@std/path";
import { toPathString } from "../utils.ts";
import type {
    CreateDirectoryOptions,
    DirectoryInfo,
    FileInfo,
    FsFile,
    FsSupports,
    MakeTempOptions,
    OpenOptions,
    ReadOptions,
    RemoveOptions,
    SymlinkOptions,
    WriteOptions,
} from "../types.ts";
import { File } from "./file.ts";

/**
 * Changes the permissions of a file or directory asynchronously.
 * @param path The path to the file or directory.
 * @param mode The new permissions mode.
 * @returns A promise that resolves when the operation is complete.
 */
export function chmod(path: string | URL, mode: number): Promise<void> {
    return Deno.chmod(path, mode);
}
/**
 * Changes the permissions of a file or directory synchronously.
 * @param path The path to the file or directory.
 * @param mode The new permissions mode.
 */
export function chmodSync(path: string | URL, mode: number): void {
    Deno.chmodSync(path, mode);
}

/**
 * Changes the owner and group of a file or directory asynchronously.
 * @param path The path to the file or directory.
 * @param uid The new owner user ID.
 * @param gid The new owner group ID.
 * @returns A promise that resolves when the operation is complete.
 */
export function chown(
    path: string | URL,
    uid: number,
    gid: number,
): Promise<void> {
    return Deno.chown(path, uid, gid);
}

/**
 * Changes the owner and group of a file or directory synchronously.
 * @param path The path to the file or directory.
 * @param uid The new owner user ID.
 * @param gid The new owner group ID.
 */
export function chownSync(path: string | URL, uid: number, gid: number): void {
    Deno.chownSync(path, uid, gid);
}

/**
 * Copies a file asynchronously.
 * @param from The path to the source file.
 * @param to The path to the destination file.
 * @returns A promise that resolves when the operation is complete.
 */
export function copyFile(
    from: string | URL,
    to: string | URL,
): Promise<void> {
    return Deno.copyFile(from, to);
}

/**
 * Synchronously copies a file.
 * @param from The path to the source file.
 * @param to The path to the destination file.
 */
export function copyFileSync(
    from: string | URL,
    to: string | URL,
): void {
    Deno.copyFileSync(from, to);
}

/**
 * Gets the current working directory.
 * @returns The current working directory.
 */
export function cwd(): string {
    return Deno.cwd();
}

/**
 * Gets the current group id on POSIX platforms.
 * Returns `null` on Windows.
 */
export function gid(): number | null {
    return Deno.gid();
}

/**
 * Checks if a path is a directory asynchronously.
 * @param path The path to check.
 * @returns A promise that resolves with a boolean indicating whether the path is a directory.
 */
export function isDir(path: string | URL): Promise<boolean> {
    return Deno.stat(path)
        .then((stat) => stat.isDirectory)
        .catch(() => false);
}
/**
 * Synchronously checks if a path is a directory.
 * @param path The path to check.
 * @returns A boolean indicating whether the path is a directory.
 */
export function isDirSync(path: string | URL): boolean {
    try {
        return Deno.statSync(path).isDirectory;
    } catch {
        return false;
    }
}

/**
 * Checks if a path is a file.
 * @param path The path to check.
 * @returns A promise that resolves with a boolean indicating whether the path is a file.
 */
export function isFile(path: string | URL): Promise<boolean> {
    return Deno.stat(path)
        .then((stat) => stat.isFile)
        .catch(() => false);
}

/**
 * Synchronously checks if a path is a file.
 * @param path The path to check.
 * @returns A boolean indicating whether the path is a file.
 */
export function isFileSync(path: string | URL): boolean {
    try {
        return Deno.statSync(path).isFile;
    } catch {
        return false;
    }
}

/**
 * Checks if an error indicates that a file or directory was not found.
 * @param err The error to check.
 * @returns A boolean indicating whether the error indicates that the file or directory was not found.
 */
export function isNotFoundError(err: unknown): boolean {
    return (err instanceof Deno.errors.NotFound);
}

/**
 * Checks if an error indicates that a file or directory already exists.
 * @param err The error to check.
 * @returns A boolean indicating whether the error indicates that the file or directory already exists.
 */
export function isAlreadyExistsError(err: unknown): boolean {
    return (err instanceof Deno.errors.AlreadyExists);
}

/**
 * Creates a hard link.
 * @param oldPath The path to the existing file.
 * @param newPath The path to the new link.
 * @returns A promise that resolves when the operation is complete.
 */
export function link(oldPath: string | URL, newPath: string | URL): Promise<void> {
    return Deno.link(toPathString(oldPath), toPathString(newPath));
}

/**
 * Synchronously creates a hard link.
 * @param oldPath The path to the existing file.
 * @param newPath The path to the new link.
 */
export function linkSync(oldPath: string | URL, newPath: string | URL): void {
    Deno.linkSync(toPathString(oldPath), toPathString(newPath));
}

/**
 * Gets information about a file or directory.
 * @param path The path to the file or directory.
 * @returns A promise that resolves with the file information.
 */
export function lstat(path: string | URL): Promise<FileInfo> {
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
}

/**
 * Gets information about a file or directory synchronously.
 * @param path The path to the file or directory.
 * @returns The file information.
 */
export function lstatSync(path: string | URL): FileInfo {
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
}

/**
 * Creates a directory.
 * @param path The path to the directory.
 * @param options The options for creating the directory (optional).
 * @returns A promise that resolves when the operation is complete.
 */
export function makeDir(
    path: string | URL,
    options?: CreateDirectoryOptions | undefined,
): Promise<void> {
    return Deno.mkdir(path, options);
}

/**
 * Synchronously creates a directory.
 * @param path The path to the directory.
 * @param options The options for creating the directory (optional).
 */
export function makeDirSync(
    path: string | URL,
    options?: CreateDirectoryOptions | undefined,
): void {
    Deno.mkdirSync(path, options);
}

/**
 * Creates a temporary directory.
 * @param options The options for creating the temporary directory (optional).
 * @returns A promise that resolves with the path to the created temporary directory.
 */
export function makeTempDir(options?: MakeTempOptions): Promise<string> {
    return Deno.makeTempDir(options);
}

/**
 * Synchronously creates a temporary directory.
 * @param options The options for creating the temporary directory (optional).
 * @returns The path to the created temporary directory.
 */
export function makeTempDirSync(options?: MakeTempOptions): string {
    return Deno.makeTempDirSync(options);
}

/**
 * Creates a temporary file.
 * @param options The options for creating the temporary file (optional).
 * @returns A promise that resolves with the path to the created temporary file.
 */
export function makeTempFile(options?: MakeTempOptions): Promise<string> {
    return Deno.makeTempFile(options);
}

/**
 * Creates a temporary file synchronously.
 * @param options The options for creating the temporary file (optional).
 * @returns The path to the created temporary file.
 */
export function makeTempFileSync(options?: MakeTempOptions): string {
    return Deno.makeTempFileSync(options);
}

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
export async function open(path: string | URL, options: OpenOptions): Promise<FsFile> {
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

    return new File(file, p, supports);
}

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
export function openSync(path: string | URL, options: OpenOptions): FsFile {
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

    return new File(file, p, supports);
}

/**
 * Reads the contents of a directory.
 * @param path The path to the directory.
 * @returns An async iterable that yields directory information.
 */
export function readDir(
    path: string | URL,
): AsyncIterable<DirectoryInfo> {
    return Deno.readDir(path);
}

/**
 * Synchronously reads the contents of a directory.
 * @param path The path to the directory.
 * @returns An iterable that yields directory information.
 */
export function readDirSync(
    path: string | URL,
): Iterable<DirectoryInfo> {
    return Deno.readDirSync(path);
}

/**
 * Reads the contents of a file.
 * @param path The path to the file.
 * @param options The options for reading the file (optional).
 * @returns A promise that resolves with the file contents as a Uint8Array.
 */
export function readFile(path: string | URL, options?: ReadOptions): Promise<Uint8Array> {
    return Deno.readFile(path, options);
}

/**
 * Synchronously reads the contents of a file.
 * @param path The path to the file.
 * @returns The file contents as a Uint8Array.
 */
export function readFileSync(path: string | URL): Uint8Array {
    return Deno.readFileSync(path);
}

/**
 * Reads the target of a symbolic link.
 * @param path The path to the symbolic link.
 * @returns A promise that resolves with the target path as a string.
 */
export function readLink(path: string | URL): Promise<string> {
    return Deno.readLink(path);
}

/**
 * Synchronously reads the target of a symbolic link.
 * @param path The path to the symbolic link.
 * @returns The target path as a string.
 */
export function readLinkSync(path: string | URL): string {
    return Deno.readLinkSync(path);
}

/**
 * Reads the contents of a file as text.
 * @param path The path to the file.
 * @param options The options for reading the file (optional).
 * @returns A promise that resolves with the file contents as a string.
 */
export function readTextFile(path: string | URL, options?: ReadOptions): Promise<string> {
    return Deno.readTextFile(path, options);
}

/**
 * Synchronously Reads the contents of a file as text.
 * @param path The path to the file.
 * @returns The file contents as a string.
 */
export function readTextFileSync(path: string | URL): string {
    return Deno.readTextFileSync(path);
}

/**
 * Resolves the real path of a file or directory.
 * @param path The path to the file or directory.
 * @returns A promise that resolves with the real path as a string.
 */
export function realPath(path: string | URL): Promise<string> {
    return Deno.realPath(path);
}

/**
 * Synchronously resolves the real path of a file or directory.
 * @param path The path to the file or directory.
 * @returns The real path as a string.
 */
export function realPathSync(path: string | URL): string {
    return Deno.realPathSync(path);
}

/**
 * Removes a file or directory.
 * @param path The path to the file or directory.
 * @param options The options for removing the file or directory (optional).
 * @returns A promise that resolves when the operation is complete.
 */
export function remove(
    path: string | URL,
    options?: RemoveOptions,
): Promise<void> {
    return Deno.remove(path, options);
}

/**
 * Synchronously removes a file or directory.
 * @param path The path to the file or directory.
 * @param options The options for removing the file or directory (optional).
 */
export function removeSync(path: string | URL, options?: RemoveOptions): void {
    return Deno.removeSync(path, options);
}

/**
 * Renames a file or directory.
 * @param oldPath The path to the existing file or directory.
 * @param newPath The path to the new file or directory.
 * @returns A promise that resolves when the operation is complete.
 */
export function rename(
    oldPath: string | URL,
    newPath: string | URL,
): Promise<void> {
    return Deno.rename(oldPath, newPath);
}

/**
 * Synchronously renames a file or directory.
 * @param oldPath The path to the existing file or directory.
 * @param newPath The path to the new file or directory.
 */
export function renameSync(oldPath: string | URL, newPath: string | URL): void {
    Deno.renameSync(oldPath, newPath);
}

/**
 * Gets information about a file or directory.
 * @param path The path to the file or directory.
 * @returns A promise that resolves with the file information.
 */
export function stat(path: string | URL): Promise<FileInfo> {
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
}

/**
 * Gets information about a file or directory synchronously.
 * @param path The path to the file or directory.
 * @returns The file information.
 */
export function statSync(path: string | URL): FileInfo {
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
}

/**
 * Creates a symbolic link.
 * @param target The path to the target file or directory.
 * @param path The path to the symbolic link.
 * @param type The type of the symbolic link (optional).
 * @returns A promise that resolves when the operation is complete.
 */
export function symlink(
    target: string | URL,
    path: string | URL,
    type?: SymlinkOptions,
): Promise<void> {
    return Deno.symlink(target, path, type);
}

/**
 * Synchronously creates a symbolic link.
 * @param target The path to the target file or directory.
 * @param path The path to the symbolic link.
 * @param type The type of the symbolic link (optional).
 */
export function symlinkSync(
    target: string | URL,
    path: string | URL,
    type?: SymlinkOptions,
): void {
    Deno.symlinkSync(target, path, type);
}

/**
 * Writes text data to a file.
 * @param path The path to the file.
 * @param data The text data to write.
 * @param options The options for writing the file (optional).
 * @returns A promise that resolves when the operation is complete.
 */
export function writeTextFile(
    path: string | URL,
    data: string,
    options?: WriteOptions,
): Promise<void> {
    return Deno.writeTextFile(path, data, options);
}

/**
 * Synchronously writes text data to a file.
 * @param path The path to the file.
 * @param data The text data to write.
 * @param options The options for writing the file (optional).
 */
export function writeTextFileSync(
    path: string | URL,
    data: string,
    options?: WriteOptions,
): void {
    Deno.writeTextFileSync(path, data, options);
}

/**
 * Writes binary data to a file.
 * @param path The path to the file.
 * @param data The binary data to write.
 * @param options The options for writing the file (optional).
 * @returns A promise that resolves when the operation is complete.
 */
export function writeFile(
    path: string | URL,
    data: Uint8Array | ReadableStream<Uint8Array>,
    options?: WriteOptions | undefined,
): Promise<void> {
    return Deno.writeFile(path, data, options);
}

/**
 * Synchronously writes binary data to a file.
 * @param path The path to the file.
 * @param data The binary data to write.
 * @param options The options for writing the file (optional).
 */
export function writeFileSync(
    path: string | URL,
    data: Uint8Array,
    options?: WriteOptions | undefined,
): void {
    return Deno.writeFileSync(path, data, options);
}

/**
 * Gets the current user id on POSIX platforms.
 * Returns `null` on Windows.
 */
export function uid(): number | null {
    return Deno.uid();
}

/**
 * Changes the access time and modification time of a file or directory.
 * @param path The path to the file or directory.
 * @param atime The new access time.
 * @param mtime The new modification time.
 * @returns A promise that resolves when the operation is complete.
 */
export function utime(
    path: string | URL,
    atime: number | Date,
    mtime: number | Date,
): Promise<void> {
    return Deno.utime(path, atime, mtime);
}

/**
 * Synchronously changes the access time and modification time of a file or directory.
 * @param path The path to the file or directory.
 * @param atime The new access time.
 * @param mtime The new modification time.
 */
export function utimeSync(
    path: string | URL,
    atime: number | Date,
    mtime: number | Date,
): void {
    Deno.utimeSync(path, atime, mtime);
}
