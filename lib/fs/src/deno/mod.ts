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

export function uid(): number | null {
    return Deno.uid();
}

export function isNotFoundError(err: unknown): boolean {
    return (err instanceof Deno.errors.NotFound);
}

export function isAlreadyExistsError(err: unknown): boolean {
    return (err instanceof Deno.errors.AlreadyExists);
}

export function gid(): number | null {
    return Deno.gid();
}

export function cwd(): string {
    return Deno.cwd();
}

export function copyFile(
    from: string | URL,
    to: string | URL,
): Promise<void> {
    return Deno.copyFile(from, to);
}

export function copyFileSync(
    from: string | URL,
    to: string | URL,
): void {
    Deno.copyFileSync(from, to);
}

export function isDir(path: string | URL): Promise<boolean> {
    return Deno.stat(path)
        .then((stat) => stat.isDirectory)
        .catch(() => false);
}

export function isDirSync(path: string | URL): boolean {
    try {
        return Deno.statSync(path).isDirectory;
    } catch {
        return false;
    }
}

export function isFile(path: string | URL): Promise<boolean> {
    return Deno.stat(path)
        .then((stat) => stat.isFile)
        .catch(() => false);
}

export function isFileSync(path: string | URL): boolean {
    try {
        return Deno.statSync(path).isFile;
    } catch {
        return false;
    }
}

export function link(oldPath: string | URL, newPath: string | URL): Promise<void> {
    return Deno.link(toPathString(oldPath), toPathString(newPath));
}

export function linkSync(oldPath: string | URL, newPath: string | URL): void {
    Deno.linkSync(toPathString(oldPath), toPathString(newPath));
}

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

export function chmod(path: string | URL, mode: number): Promise<void> {
    return Deno.chmod(path, mode);
}

export function chmodSync(path: string | URL, mode: number): void {
    Deno.chmodSync(path, mode);
}

export function chown(
    path: string | URL,
    uid: number,
    gid: number,
): Promise<void> {
    return Deno.chown(path, uid, gid);
}

export function chownSync(path: string | URL, uid: number, gid: number): void {
    Deno.chownSync(path, uid, gid);
}

export function makeTempDirSync(options?: MakeTempOptions): string {
    return Deno.makeTempDirSync(options);
}

export function makeTempDir(options?: MakeTempOptions): Promise<string> {
    return Deno.makeTempDir(options);
}

export function makeTempFileSync(options?: MakeTempOptions): string {
    return Deno.makeTempFileSync(options);
}

export function makeTempFile(options?: MakeTempOptions): Promise<string> {
    return Deno.makeTempFile(options);
}

export function makeDir(
    path: string | URL,
    options?: CreateDirectoryOptions | undefined,
): Promise<void> {
    return Deno.mkdir(path, options);
}

export function makeDirSync(
    path: string | URL,
    options?: CreateDirectoryOptions | undefined,
): void {
    Deno.mkdirSync(path, options);
}

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

export function readDir(
    path: string | URL,
): AsyncIterable<DirectoryInfo> {
    return Deno.readDir(path);
}

export function readDirSync(
    path: string | URL,
): Iterable<DirectoryInfo> {
    return Deno.readDirSync(path);
}

export function readLink(path: string | URL): Promise<string> {
    return Deno.readLink(path);
}

export function readLinkSync(path: string | URL): string {
    return Deno.readLinkSync(path);
}

export function readTextFileSync(path: string | URL): string {
    return Deno.readTextFileSync(path);
}

export function readTextFile(path: string | URL, options?: ReadOptions): Promise<string> {
    return Deno.readTextFile(path, options);
}

export function readFile(path: string | URL, options?: ReadOptions): Promise<Uint8Array> {
    return Deno.readFile(path, options);
}

export function readFileSync(path: string | URL): Uint8Array {
    return Deno.readFileSync(path);
}

export function realPath(path: string | URL): Promise<string> {
    return Deno.realPath(path);
}

export function realPathSync(path: string | URL): string {
    return Deno.realPathSync(path);
}

export function rename(
    oldPath: string | URL,
    newPath: string | URL,
): Promise<void> {
    return Deno.rename(oldPath, newPath);
}

export function renameSync(oldPath: string | URL, newPath: string | URL): void {
    Deno.renameSync(oldPath, newPath);
}

export function remove(
    path: string | URL,
    options?: RemoveOptions,
): Promise<void> {
    return Deno.remove(path, options);
}

export function removeSync(path: string | URL, options?: RemoveOptions): void {
    return Deno.removeSync(path, options);
}

export function symlink(
    target: string | URL,
    path: string | URL,
    type?: SymlinkOptions,
): Promise<void> {
    return Deno.symlink(target, path, type);
}

export function symlinkSync(
    target: string | URL,
    path: string | URL,
    type?: SymlinkOptions,
): void {
    Deno.symlinkSync(target, path, type);
}

export function writeTextFileSync(
    path: string | URL,
    data: string,
    options?: WriteOptions,
): void {
    Deno.writeTextFileSync(path, data, options);
}

export function writeTextFile(
    path: string | URL,
    data: string,
    options?: WriteOptions,
): Promise<void> {
    return Deno.writeTextFile(path, data, options);
}

export function writeFile(
    path: string | URL,
    data: Uint8Array | ReadableStream<Uint8Array>,
    options?: WriteOptions | undefined,
): Promise<void> {
    return Deno.writeFile(path, data, options);
}

export function writeFileSync(
    path: string | URL,
    data: Uint8Array,
    options?: WriteOptions | undefined,
): void {
    return Deno.writeFileSync(path, data, options);
}

export function utime(
    path: string | URL,
    atime: number | Date,
    mtime: number | Date,
): Promise<void> {
    return Deno.utime(path, atime, mtime);
}

export function utimeSync(
    path: string | URL,
    atime: number | Date,
    mtime: number | Date,
): void {
    Deno.utimeSync(path, atime, mtime);
}