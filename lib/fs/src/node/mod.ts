import fs from "node:fs";
import fsa from "node:fs/promises";
import process from "node:process";
import { basename, join } from "@std/path";
import { File } from "./file.ts";
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
import { isDebugEnabled, writeLine } from "@gnome/debug";

const WIN = process.platform === "win32";

function randomName(prefix?: string, suffix?: string): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const rng = crypto.getRandomValues(new Uint8Array(12));
    const name = Array.from(rng)
        .map((x) => chars[x % chars.length])
        .join("");

    if (prefix && suffix) {
        return `${prefix}-${name}${suffix}`;
    }

    if (prefix) {
        return `${prefix}-${name}`;
    }

    if (suffix) {
        return `${name}${suffix}`;
    }

    return name;
}

/**
 * Changes the permissions of a file or directory.
 * @param path The path to the file or directory.
 * @param mode The new permissions mode.
 * @returns A promise that resolves when the operation is complete.
 */
export function chmod(path: string | URL, mode: number): Promise<void> {
    return fsa.chmod(path, mode);
}

/**
 * Synchronously changes the permissions of a file or directory.
 * @param path The path to the file or directory.
 * @param mode The new permissions mode.
 */
export function chmodSync(path: string | URL, mode: number): void {
    fs.chmodSync(path, mode);
}
/**
 * Changes the owner and group of a file or directory.
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
    return fsa.chown(path, uid, gid);
}

/**
 * Synchronously changes the owner and group of a file or directory.
 * @param path The path to the file or directory.
 * @param uid The new owner user ID.
 * @param gid The new owner group ID.
 */
export function chownSync(path: string | URL, uid: number, gid: number): void {
    fs.chownSync(path, uid, gid);
}

/**
 * Copies a file.
 * @param from The path to the source file.
 * @param to The path to the destination file.
 * @returns A promise that resolves when the operation is complete.
 */
export async function copyFile(
    src: string | URL,
    dest: string | URL,
): Promise<void> {
    return await fsa.copyFile(src, dest);
}

/**
 * Synchronously copies a file.
 * @param from The path to the source file.
 * @param to The path to the destination file.
 */
export function copyFileSync(
    src: string | URL,
    dest: string | URL,
): void {
    fs.copyFileSync(src, dest);
}

/**
 * Gets the current working directory.
 * @returns The current working directory.
 */
export function cwd(): string {
    return process.cwd();
}

/**
 * Gets the current group id on POSIX platforms.
 * Returns `null` on Windows.
 */
export function gid(): number | null {
    if (process.getgid === undefined) {
        return null;
    }

    const gid = process.getgid();
    if (gid === -1 || gid === undefined) {
        return null;
    }

    return gid;
}

/**
 * Checks if an error indicates that a file or directory already exists.
 * @param err The error to check.
 * @returns A boolean indicating whether the error indicates that the file or directory already exists.
 */
export function isAlreadyExistsError(err: unknown): boolean {
    if (!(err instanceof Error)) {
        return false;
    }

    // deno-lint-ignore no-explicit-any
    return (err as any).code === "EEXIST";
}

/**
 * Checks if a path is a directory.
 * @param path The path to check.
 * @returns A promise that resolves with a boolean indicating whether the path is a directory.
 */
export function isDir(path: string | URL): Promise<boolean> {
    return fsa.stat(path)
        .then((stat) => stat.isDirectory())
        .catch(() => false);
}

/**
 * Synchronously checks if a path is a directory.
 * @param path The path to check.
 * @returns A boolean indicating whether the path is a directory.
 */
export function isDirSync(path: string | URL): boolean {
    try {
        return fs.statSync(path).isDirectory();
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
    return fsa.stat(path)
        .then((stat) => stat.isFile())
        .catch(() => false);
}

/**
 * Synchronously checks if a path is a file.
 * @param path The path to check.
 * @returns A boolean indicating whether the path is a file.
 */
export function isFileSync(path: string | URL): boolean {
    try {
        return fs.statSync(path).isFile();
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
    if (!(err instanceof Error)) {
        return false;
    }

    // deno-lint-ignore no-explicit-any
    return (err as any).code === "ENOENT";
}

/**
 * Creates a hard link.
 * @param oldPath The path to the existing file.
 * @param newPath The path to the new link.
 * @returns A promise that resolves when the operation is complete.
 */
export function link(oldPath: string | URL, newPath: string | URL): Promise<void> {
    return fsa.link(oldPath, newPath);
}

/**
 * Synchronously creates a hard link.
 * @param oldPath The path to the existing file.
 * @param newPath The path to the new link.
 */
export function linkSync(oldPath: string | URL, newPath: string | URL): void {
    fs.linkSync(oldPath, newPath);
}

/**
 * Gets information about a file or directory.
 * @param path The path to the file or directory.
 * @returns A promise that resolves with the file information.
 */
export function lstat(path: string | URL): Promise<FileInfo> {
    return fsa.lstat(path).then((stat) => {
        const p = path instanceof URL ? path.toString() : path;
        return {
            isFile: stat.isFile(),
            isDirectory: stat.isDirectory(),
            isSymlink: stat.isSymbolicLink(),
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
            isBlockDevice: stat.isBlockDevice(),
            isCharDevice: stat.isCharacterDevice(),
            isSocket: stat.isSocket(),
            isFifo: stat.isFIFO(),
        } as FileInfo;
    });
}

/**
 * Gets information about a file or directory synchronously.
 * @param path The path to the file or directory.
 * @returns The file information.
 */
export function lstatSync(path: string | URL): FileInfo {
    const stat = fs.lstatSync(path);
    const p = path instanceof URL ? path.toString() : path;
    return {
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory(),
        isSymlink: stat.isSymbolicLink(),
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
        isBlockDevice: stat.isBlockDevice(),
        isCharDevice: stat.isCharacterDevice(),
        isSocket: stat.isSocket(),
        isFifo: stat.isFIFO(),
    };
}

/**
 * Creates a directory.
 * @param path The path to the directory.
 * @param options The options for creating the directory (optional).
 * @returns A promise that resolves when the operation is complete.
 */
export async function makeDir(
    path: string | URL,
    options?: CreateDirectoryOptions | undefined,
): Promise<void> {
    await fsa.mkdir(path, options);
}
/**
 * Synchronously a directory.
 * @param path The path to the directory.
 * @param options The options for creating the directory (optional).
 */
export function makeDirSync(
    path: string | URL,
    options?: CreateDirectoryOptions | undefined,
): void {
    fs.mkdirSync(path, options);
}

/**
 * Creates a temporary directory.
 * @param options The options for creating the temporary directory (optional).
 * @returns A promise that resolves with the path to the created temporary directory.
 */
export async function makeTempDir(options?: MakeTempOptions): Promise<string> {
    options ??= {};
    options.prefix ??= "tmp";

    if (!options.dir) {
        options.dir = WIN ? (process.env.TEMP ?? "c:\\Temp") : (process.env.TMPDIR ?? "/tmp");
    }

    let dir = options.dir;
    if (options.prefix) {
        dir = join(dir, options.prefix);
    }

    return await fsa.mkdtemp(dir);
}

/**
 * Synchronously creates a temporary directory.
 * @param options The options for creating the temporary directory (optional).
 * @returns The path to the created temporary directory.
 */
export function makeTempDirSync(options?: MakeTempOptions): string {
    options ??= {};
    options.prefix ??= "tmp";

    if (!options.dir) {
        options.dir = WIN ? (process.env.TEMP ?? "c:\\Temp") : (process.env.TMPDIR ?? "/tmp");
    }

    let dir = options.dir;
    if (options.prefix) {
        dir = join(dir, options.prefix);
    }

    return fs.mkdtempSync(dir);
}

/**
 * Creates a temporary file.
 * @param options The options for creating the temporary file (optional).
 * @returns A promise that resolves with the path to the created temporary file.
 */
export async function makeTempFile(options?: MakeTempOptions): Promise<string> {
    options ??= {};
    options.prefix ??= "tmp";

    let dir: string;
    if (!options.dir) {
        dir = WIN ? (process.env.TEMP ?? "c:\\Temp") : (process.env.TMPDIR ?? "/tmp");
    } else {
        dir = options.dir;
    }

    const r = randomName(options.prefix, options.suffix);
    const sep = WIN ? "\\" : "/";

    await makeDir(dir, { recursive: true });

    const file = `${options.dir}${sep}${r}`;

    fs.writeFileSync(file, new Uint8Array(0), { mode: 0o644 });

    return file;
}

/**
 * Synchronously creates a temporary file.
 * @param options The options for creating the temporary file (optional).
 * @returns The path to the created temporary file.
 */
export function makeTempFileSync(options?: MakeTempOptions): string {
    options ??= {};
    options.prefix ??= "tmp";

    if (!options.dir) {
        options.dir = WIN ? (process.env.TEMP ?? "c:\\Temp") : (process.env.TMPDIR ?? "/tmp");
    }

    const r = randomName(options.prefix, options.suffix);
    const sep = WIN ? "\\" : "/";

    makeDirSync(options.dir, { recursive: true });

    const file = `${options.dir}${sep}${r}`;

    fs.writeFileSync(file, new Uint8Array(0), { mode: 0o644 });
    return file;
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
export function open(path: string | URL, options: OpenOptions): Promise<FsFile> {
    let flags = "r";
    const supports: FsSupports[] = [];
    if (options.read) {
        if (options.write) {
            flags = "w";
            supports.push("write");
        } else if (!options.append) {
            flags = "a";
            supports.push("write");
        } else {
            flags = "r";
            supports.push("read");
        }
    }

    if (options.createNew && (options.write || options.append)) {
        flags += "x+";
    } else if ((options.create || options.truncate) && (options.write || options.append)) {
        flags += "+";
        supports.push("truncate");
    }

    return new Promise<FsFile>((resolve, reject) => {
        fs.open(path, flags, options.mode, (err, fd) => {
            if (err) {
                reject(err);
                return;
            }
            const p = path instanceof URL ? path.toString() : path;
            resolve(new File(fd, p, supports));
        });
    });
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
    let flags = "r";
    const supports: FsSupports[] = [];
    if (options.read) {
        if (options.write) {
            flags = "w";
            supports.push("write");
        } else if (!options.append) {
            flags = "a";
            supports.push("write");
        } else {
            flags = "r";
            supports.push("read");
        }
    }

    if (options.createNew && (options.write || options.append)) {
        flags += "x+";
    } else if ((options.create || options.truncate) && (options.write || options.append)) {
        flags += "+";
        supports.push("truncate");
    }

    const fd = fs.openSync(path, flags, options.mode);
    const p = path instanceof URL ? path.toString() : path;
    return new File(fd, p, supports);
}

/**
 * Reads the contents of a directory.
 * @param path The path to the directory.
 * @returns An async iterable that yields directory information.
 */
export function readDir(
    path: string | URL,
): AsyncIterable<DirectoryInfo> {
    if (path instanceof URL) {
        path = path.toString();
    }

    const iterator = async function* () {
        const data = await fsa.readdir(path);
        for (const d of data) {
            const next = join(path, d);
            try {
                const info = await lstat(join(path, d));
                yield {
                    name: d,
                    isFile: info.isFile,
                    isDirectory: info.isDirectory,
                    isSymlink: info.isSymlink,
                };
            } catch (e) {
                if (isDebugEnabled() && e instanceof Error) {
                    const message = e.stack ?? e.message;
                    const e2 = e as NodeJS.ErrnoException;
                    if (e2.code) {
                        writeLine(`Failed to lstat ${next}\n${e2.code}\n${message}`);
                    } else {
                        writeLine(`Failed to lstat ${next}\n${message}`);
                    }
                }
            }
        }
    };

    return iterator();
}

/**
 * Synchronously reads the contents of a directory.
 * @param path The path to the directory.
 * @returns An iterable that yields directory information.
 */
export function* readDirSync(
    path: string | URL,
): Iterable<DirectoryInfo> {
    if (path instanceof URL) {
        path = path.toString();
    }

    const data = fs.readdirSync(path);
    for (const d of data) {
        const next = join(path, d);
        try {
            const info = lstatSync(next);

            yield {
                name: d,
                isFile: info.isFile,
                isDirectory: info.isDirectory,
                isSymlink: info.isSymlink,
            };
        } catch (e) {
            if (isDebugEnabled() && e instanceof Error) {
                const message = e.stack ?? e.message;
                const e2 = e as NodeJS.ErrnoException;
                if (e2.code) {
                    writeLine(`Failed to lstat ${next}\n${e2.code}\n ${message}`);
                } else {
                    writeLine(`Failed to lstat ${next}\n${message}`);
                }
            }
        }
    }
}

/**
 * Reads the contents of a file.
 * @param path The path to the file.
 * @param options The options for reading the file (optional).
 * @returns A promise that resolves with the file contents as a Uint8Array.
 */
export function readFile(path: string | URL, options?: ReadOptions): Promise<Uint8Array> {
    if (options?.signal) {
        options.signal.throwIfAborted();
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;

        if (!g.AbortController) {
            throw new Error("AbortController not available");
        }
        const c = new g.AbortController();
        c.signal = options.signal;

        options.signal.onabort = () => {
            c.abort();
        };

        return fsa.readFile(path, { signal: c.signal });
    }

    return fsa.readFile(path);
}

/**
 * Synchronously reads the contents of a file.
 * @param path The path to the file.
 * @returns The file contents as a Uint8Array.
 */
export function readFileSync(path: string | URL): Uint8Array {
    return fs.readFileSync(path);
}

/**
 * Reads the target of a symbolic link.
 * @param path The path to the symbolic link.
 * @returns A promise that resolves with the target path as a string.
 */
export function readLink(path: string | URL): Promise<string> {
    return fsa.readlink(path);
}

/**
 * Synchronously reads the target of a symbolic link.
 * @param path The path to the symbolic link.
 * @returns The target path as a string.
 */
export function readLinkSync(path: string | URL): string {
    return fs.readlinkSync(path);
}

/**
 * Reads the contents of a file as text.
 * @param path The path to the file.
 * @param options The options for reading the file (optional).
 * @returns A promise that resolves with the file contents as a string.
 */
export function readTextFile(path: string | URL, options?: ReadOptions): Promise<string> {
    if (options?.signal) {
        options.signal.throwIfAborted();
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;

        if (!g.AbortController) {
            throw new Error("AbortController not available");
        }
        const c = new g.AbortController();
        c.signal = options.signal;

        options.signal.onabort = () => {
            c.abort();
        };

        return fsa.readFile(path, { encoding: "utf8", signal: c.signal });
    }

    return fsa.readFile(path, { encoding: "utf8" });
}

/**
 * Synchronously Reads the contents of a file as text.
 * @param path The path to the file.
 * @returns The file contents as a string.
 */
export function readTextFileSync(path: string | URL): string {
    return fs.readFileSync(path, { encoding: "utf8" });
}

/**
 * Resolves the real path of a file or directory.
 * @param path The path to the file or directory.
 * @returns A promise that resolves with the real path as a string.
 */
export function realPath(path: string | URL): Promise<string> {
    return fsa.realpath(path);
}

/**
 * Synchronously resolves the real path of a file or directory.
 * @param path The path to the file or directory.
 * @returns The real path as a string.
 */
export function realPathSync(path: string | URL): string {
    return fs.realpathSync(path);
}

/**
 * Removes a file or directory.
 * @param path The path to the file or directory.
 * @param options The options for removing the file or directory (optional).
 * @returns A promise that resolves when the operation is complete.
 */
export async function remove(
    path: string | URL,
    options?: RemoveOptions,
): Promise<void> {
    const isFolder = await isDir(path);
    if (isFolder) {
        return await fsa.rmdir(path, { ...options });
    }

    return fsa.rm(path, { ...options, force: true });
}

/**
 * Synchronously removes a file or directory.
 * @param path The path to the file or directory.
 * @param options The options for removing the file or directory (optional).
 */
export function removeSync(path: string | URL, options?: RemoveOptions): void {
    const isFolder = isDirSync(path);
    if (isFolder) {
        return fs.rmdirSync(path, { ...options });
    }

    return fs.rmSync(path, { ...options, force: true });
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
    return fsa.rename(oldPath, newPath);
}

/**
 * Synchronously renames a file or directory.
 * @param oldPath The path to the existing file or directory.
 * @param newPath The path to the new file or directory.
 */
export function renameSync(oldPath: string | URL, newPath: string | URL): void {
    return fs.renameSync(oldPath, newPath);
}

/**
 * Gets information about a file or directory.
 * @param path The path to the file or directory.
 * @returns A promise that resolves with the file information.
 */
export function stat(path: string | URL): Promise<FileInfo> {
    return fsa.stat(path).then((stat) => {
        const p = path instanceof URL ? path.toString() : path;
        return {
            isFile: stat.isFile(),
            isDirectory: stat.isDirectory(),
            isSymlink: stat.isSymbolicLink(),
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
            isBlockDevice: stat.isBlockDevice(),
            isCharDevice: stat.isCharacterDevice(),
            isSocket: stat.isSocket(),
            isFifo: stat.isFIFO(),
        };
    });
}

/**
 * Synchronously gets information about a file or directory.
 * @param path The path to the file or directory.
 * @returns The file information.
 */
export function statSync(path: string | URL): FileInfo {
    const stat = fs.statSync(path);
    const p = path instanceof URL ? path.toString() : path;

    return {
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory(),
        isSymlink: stat.isSymbolicLink(),
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
        isBlockDevice: stat.isBlockDevice(),
        isCharDevice: stat.isCharacterDevice(),
        isSocket: stat.isSocket(),
        isFifo: stat.isFIFO(),
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
    opttions?: SymlinkOptions,
): Promise<void> {
    return fsa.symlink(target, path, opttions?.type);
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
    options?: SymlinkOptions,
): void {
    fs.symlinkSync(target, path, options?.type);
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
    if (data instanceof ReadableStream) {
        const sr = fs.createWriteStream(path, options);
        const writer = new WritableStream({
            write(chunk) {
                sr.write(chunk);
            },
        });

        return data.pipeTo(writer).finally(() => {
            sr.close();
        });
    }

    const o: fs.WriteFileOptions = {};
    o.mode = options?.mode;
    o.flag = options?.append ? "a" : "w";
    if (options?.create) {
        o.flag += "+";
    }
    o.encoding = "utf8";
    if (options?.signal) {
        options.signal.throwIfAborted();
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;

        if (!g.AbortController) {
            throw new Error("AbortController not available");
        }
        const c = new g.AbortController();
        c.signal = options.signal;

        options.signal.onabort = () => {
            c.abort();
        };

        o.signal = c.signal;
    }

    return fsa.writeFile(path, data, o);
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
    const o: fs.WriteFileOptions = {};
    o.mode = options?.mode;
    o.flag = options?.append ? "a" : "w";
    if (options?.create) {
        o.flag += "+";
    }
    o.encoding = "utf8";
    if (options?.signal) {
        options.signal.throwIfAborted();
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;

        if (!g.AbortController) {
            throw new Error("AbortController not available");
        }
        const c = new g.AbortController();
        c.signal = options.signal;

        options.signal.onabort = () => {
            c.abort();
        };

        o.signal = c.signal;
    }

    fs.writeFileSync(path, data, o);
}

/**
 * Writes text data to a file.
 * @param path The path to the file.
 * @param data The text data to write.
 * @param options The options for writing the file (optional).
 * @returns A promise that resolves when the operation is complete.
 */
export async function writeTextFile(
    path: string | URL,
    data: string,
    options?: WriteOptions,
): Promise<void> {
    const o: fs.WriteFileOptions = {};
    o.mode = options?.mode;
    o.encoding = "utf8";
    o.flag = options?.append ? "a" : "w";
    if (options?.create) {
        o.flag += "+";
    }
    o.encoding = "utf8";
    if (options?.signal) {
        options.signal.throwIfAborted();
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;

        if (!g.AbortController) {
            throw new Error("AbortController not available");
        }
        const c = new g.AbortController();
        c.signal = options.signal;

        options.signal.onabort = () => {
            c.abort();
        };

        o.signal = c.signal;
    }

    await fsa.writeFile(path, data, o);
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
    const o: fs.WriteFileOptions = {};
    o.mode = options?.mode;
    o.encoding = "utf8";
    o.flag = options?.append ? "a" : "w";
    if (options?.create) {
        o.flag += "+";
    }
    o.encoding = "utf8";
    if (options?.signal) {
        options.signal.throwIfAborted();
        // deno-lint-ignore no-explicit-any
        const g = globalThis as any;

        if (!g.AbortController) {
            throw new Error("AbortController not available");
        }
        const c = new g.AbortController();
        c.signal = options.signal;

        options.signal.onabort = () => {
            c.abort();
        };

        o.signal = c.signal;
    }
    fs.writeFileSync(path, data, o);
}

/**
 * Gets the current user id on POSIX platforms.
 * Returns `null` on Windows.
 */
export function uid(): number | null {
    if (process.getuid === undefined) {
        return null;
    }

    const uid = process.getuid();
    if (uid === -1 || uid === undefined) {
        return null;
    }

    return uid;
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
    return fsa.utimes(path, atime, mtime);
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
    fs.utimesSync(path, atime, mtime);
}
