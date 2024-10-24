// deno-lint-ignore-file no-unused-vars

import type {
    CreateDirectoryOptions,
    DirectoryInfo,
    FileInfo,
    FsFile,
    MakeTempOptions,
    OpenOptions,
    ReadOptions,
    RemoveOptions,
    SymlinkOptions,
    WriteOptions,
} from "./types.ts";


export function uid(): number | null {
    return null;
}

export function isNotFoundError(err: unknown): boolean {
    return (err instanceof Deno.errors.NotFound);
}

export function isAlreadyExistsError(err: unknown): boolean {
    return (err instanceof Deno.errors.AlreadyExists);
}

export function gid(): number | null {
    return null;
}

export function cwd(): string {
    throw new Error("Not implemented");
}

export function copyFile(
    from: string | URL,
    to: string | URL,
): Promise<void> {
    return Promise.reject(new Error("Not implemented"));
}

export function copyFileSync(
    from: string | URL,
    to: string | URL,
): void {
    throw new Error("Not implemented");
}

export function isDir(path: string | URL): Promise<boolean> {
    return Promise.reject(new Error("Not implemented"));
}

export function isDirSync(path: string | URL): boolean {
    throw new Error("Not implemented");
}

export function isFile(path: string | URL): Promise<boolean> {
    return Promise.reject(new Error("Not implemented"));
}

export function isFileSync(path: string | URL): boolean {
    throw new Error("Not implemented");
}

export function link(oldPath: string | URL, newPath: string | URL): Promise<void> {
    return Promise.reject(new Error("Not implemented"));
}

export function linkSync(oldPath: string | URL, newPath: string | URL): void {
    throw new Error("Not implemented");
}

export function lstat(path: string | URL): Promise<FileInfo> {
    throw new Error("Not implemented");
}

export function lstatSync(path: string | URL): FileInfo {
    throw new Error("Not implemented");
}

export function chmod(path: string | URL, mode: number): Promise<void> {
    return Promise.reject(new Error("Not implemented"));
}

export function chmodSync(path: string | URL, mode: number): void {
    throw new Error("Not implemented");
}

export function chown(
    path: string | URL,
    uid: number,
    gid: number,
): Promise<void> {
    throw new Error("Not implemented");
}

export function chownSync(path: string | URL, uid: number, gid: number): void {
    throw new Error("Not implemented");
}

export function makeTempDirSync(options?: MakeTempOptions): string {
    throw new Error("Not implemented");
}

export function makeTempDir(options?: MakeTempOptions): Promise<string> {
    throw new Error("Not implemented");
}

export function makeTempFileSync(options?: MakeTempOptions): string {
    throw new Error("Not implemented");
}

export function makeTempFile(options?: MakeTempOptions): Promise<string> {
    return Promise.reject(new Error("Not implemented"));
}

export function makeDir(
    path: string | URL,
    options?: CreateDirectoryOptions | undefined,
): Promise<void> {
    return Promise.reject(new Error("Not implemented"));
}

export function makeDirSync(
    path: string | URL,
    options?: CreateDirectoryOptions | undefined,
): void {
    throw new Error("Not implemented");
}

export function open(path: string | URL, options: OpenOptions): Promise<FsFile> {
    return Promise.reject(new Error("Not implemented"));
}

export function openSync(path: string | URL, options: OpenOptions): FsFile {
    throw new Error("Not implemented");
}

export function stat(path: string | URL): Promise<FileInfo> {
    throw new Error("Not implemented");
}

export function statSync(path: string | URL): FileInfo {
    throw new Error("Not implemented");
}

export function readDir(
    path: string | URL,
): AsyncIterable<DirectoryInfo> {
    throw new Error("Not implemented");
}

export function readDirSync(
    path: string | URL,
): Iterable<DirectoryInfo> {
    throw new Error("Not implemented");
}

export function readLink(path: string | URL): Promise<string> {
    throw new Error("Not implemented");
}

export function readLinkSync(path: string | URL): string {
    throw new Error("Not implemented");
}

export function readTextFileSync(path: string | URL): string {
    throw new Error("Not implemented");
}

export function readTextFile(path: string | URL, options?: ReadOptions): Promise<string> {
    throw new Error("Not implemented");
}

export function readFile(path: string | URL, options?: ReadOptions): Promise<Uint8Array> {
    throw new Error("Not implemented");
}

export function readFileSync(path: string | URL): Uint8Array {
    throw new Error("Not implemented");
}

export function realPath(path: string | URL): Promise<string> {
    throw new Error("Not implemented");
}

export function realPathSync(path: string | URL): string {
    throw new Error("Not implemented");
}

export function rename(
    oldPath: string | URL,
    newPath: string | URL,
): Promise<void> {
    throw new Error("Not implemented");
}

export function renameSync(oldPath: string | URL, newPath: string | URL): void {
    throw new Error("Not implemented");
}

export function remove(
    path: string | URL,
    options?: RemoveOptions,
): Promise<void> {
    throw new Error("Not implemented");
}

export function removeSync(path: string | URL, options?: RemoveOptions): void {
    throw new Error("Not implemented");
}

export function symlink(
    target: string | URL,
    path: string | URL,
    type?: SymlinkOptions,
): Promise<void> {
    throw new Error("Not implemented");
}

export function symlinkSync(
    target: string | URL,
    path: string | URL,
    type?: SymlinkOptions,
): void {
    throw new Error("Not implemented");
}

export function writeTextFileSync(
    path: string | URL,
    data: string,
    options?: WriteOptions,
): void {
    throw new Error("Not implemented");
}

export function writeTextFile(
    path: string | URL,
    data: string,
    options?: WriteOptions,
): Promise<void> {
    throw new Error("Not implemented");
}

export function writeFile(
    path: string | URL,
    data: Uint8Array | ReadableStream<Uint8Array>,
    options?: WriteOptions | undefined,
): Promise<void> {
    throw new Error("Not implemented");
}

export function writeFileSync(
    path: string | URL,
    data: Uint8Array,
    options?: WriteOptions | undefined,
): void {
    throw new Error("Not implemented");
}

export function utime(
    path: string | URL,
    atime: number | Date,
    mtime: number | Date,
): Promise<void> {
    throw new Error("Not implemented");
}


export function utimeSync(
    path: string | URL,
    atime: number | Date,
    mtime: number | Date,
): void {
    throw new Error("Not implemented");
}