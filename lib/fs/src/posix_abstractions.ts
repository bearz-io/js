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
    chmod(path: string | URL, mode: number): Promise<void> {
        return Promise.reject(new Error("Not implemented"));
    },

    chmodSync(path: string | URL, mode: number): void {
        throw new Error("Not implemented");
    },

    chown(
        path: string | URL,
        uid: number,
        gid: number,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

    chownSync(path: string | URL, uid: number, gid: number): void {
        throw new Error("Not implemented");
    },

    copyFile(
        from: string | URL,
        to: string | URL,
    ): Promise<void> {
        return Promise.reject(new Error("Not implemented"));
    },

    copyFileSync(
        from: string | URL,
        to: string | URL,
    ): void {
        throw new Error("Not implemented");
    },

    cwd(): string {
        return "";
    },

    gid(): number | null {
        return null;
    },

    isAlreadyExistsError(err: unknown): boolean {
        return false;
    },

    isDir(path: string | URL): Promise<boolean> {
        return Promise.reject(new Error("Not implemented"));
    },

    isDirSync(path: string | URL): boolean {
        throw new Error("Not implemented");
    },

    isFile(path: string | URL): Promise<boolean> {
        return Promise.reject(new Error("Not implemented"));
    },

    isFileSync(path: string | URL): boolean {
        throw new Error("Not implemented");
    },

    isNotFoundError(err: unknown): boolean {
        return false;
    },

    link(oldPath: string | URL, newPath: string | URL): Promise<void> {
        return Promise.reject(new Error("Not implemented"));
    },

    linkSync(oldPath: string | URL, newPath: string | URL): void {
        throw new Error("Not implemented");
    },

    lstat(path: string | URL): Promise<FileInfo> {
        throw new Error("Not implemented");
    },

    lstatSync(path: string | URL): FileInfo {
        throw new Error("Not implemented");
    },

    makeDir(
        path: string | URL,
        options?: CreateDirectoryOptions | undefined,
    ): Promise<void> {
        return Promise.reject(new Error("Not implemented"));
    },

    makeDirSync(
        path: string | URL,
        options?: CreateDirectoryOptions | undefined,
    ): void {
        throw new Error("Not implemented");
    },

    makeTempDir(options?: MakeTempOptions): Promise<string> {
        throw new Error("Not implemented");
    },

    makeTempDirSync(options?: MakeTempOptions): string {
        throw new Error("Not implemented");
    },

    makeTempFile(options?: MakeTempOptions): Promise<string> {
        return Promise.reject(new Error("Not implemented"));
    },

    makeTempFileSync(options?: MakeTempOptions): string {
        throw new Error("Not implemented");
    },

    open(path: string | URL, options: OpenOptions): Promise<FsFile> {
        return Promise.reject(new Error("Not implemented"));
    },

    openSync(path: string | URL, options: OpenOptions): FsFile {
        throw new Error("Not implemented");
    },

    readDir(
        path: string | URL,
    ): AsyncIterable<DirectoryInfo> {
        throw new Error("Not implemented");
    },

    readDirSync(
        path: string | URL,
    ): Iterable<DirectoryInfo> {
        throw new Error("Not implemented");
    },

    readFile(path: string | URL, options?: ReadOptions): Promise<Uint8Array> {
        throw new Error("Not implemented");
    },

    readFileSync(path: string | URL): Uint8Array {
        throw new Error("Not implemented");
    },

    readLink(path: string | URL): Promise<string> {
        throw new Error("Not implemented");
    },

    readLinkSync(path: string | URL): string {
        throw new Error("Not implemented");
    },

    readTextFile(path: string | URL, options?: ReadOptions): Promise<string> {
        throw new Error("Not implemented");
    },

    readTextFileSync(path: string | URL): string {
        throw new Error("Not implemented");
    },

    realPath(path: string | URL): Promise<string> {
        throw new Error("Not implemented");
    },

    realPathSync(path: string | URL): string {
        throw new Error("Not implemented");
    },

    rename(
        oldPath: string | URL,
        newPath: string | URL,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

    renameSync(oldPath: string | URL, newPath: string | URL): void {
        throw new Error("Not implemented");
    },

    remove(
        path: string | URL,
        options?: RemoveOptions,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

    removeSync(path: string | URL, options?: RemoveOptions): void {
        throw new Error("Not implemented");
    },

    stat(path: string | URL): Promise<FileInfo> {
        throw new Error("Not implemented");
    },

    statSync(path: string | URL): FileInfo {
        throw new Error("Not implemented");
    },

    symlink(
        target: string | URL,
        path: string | URL,
        type?: SymlinkOptions,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

    symlinkSync(
        target: string | URL,
        path: string | URL,
        type?: SymlinkOptions,
    ): void {
        throw new Error("Not implemented");
    },

    writeTextFileSync(
        path: string | URL,
        data: string,
        options?: WriteOptions,
    ): void {
        throw new Error("Not implemented");
    },

    writeTextFile(
        path: string | URL,
        data: string,
        options?: WriteOptions,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

    writeFile(
        path: string | URL,
        data: Uint8Array | ReadableStream<Uint8Array>,
        options?: WriteOptions | undefined,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

    writeFileSync(
        path: string | URL,
        data: Uint8Array,
        options?: WriteOptions | undefined,
    ): void {
        throw new Error("Not implemented");
    },

    uid(): number | null {
        return null;
    },

    utime(
        path: string | URL,
        atime: number | Date,
        mtime: number | Date,
    ): Promise<void> {
        throw new Error("Not implemented");
    },

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

    get readable(): ReadableStream<Uint8Array> {
        throw new Error("Not implemented");
    }

    get writeable(): WritableStream<Uint8Array> {
        throw new Error("Not implemented");
    }

    get supports(): FsSupports[] {
        return [];
    }

    [Symbol.dispose](): void {
        return this.closeSync();
    }

    [Symbol.asyncDispose](): Promise<void> {
        return this.close();
    }

    close(): Promise<void> {
        throw new Error("Not implemented");
    }

    closeSync(): void {
        throw new Error("Not implemented");
    }

    flush(): Promise<void> {
        throw new Error("Not implemented");
    }

    flushSync(): void {
        throw new Error("Not implemented");
    }

    flushData(): Promise<void> {
        throw new Error("Not implemented");
    }

    flushDataSync(): void {
        throw new Error("Not implemented");
    }

    lock(exclusive?: boolean | undefined): Promise<void> {
        throw new Error("Not implemented");
    }

    lockSync(exclusive?: boolean | undefined): void {
        throw new Error("Not implemented");
    }

    readSync(buffer: Uint8Array): number | null {
        throw new Error("Not implemented");
    }

    read(buffer: Uint8Array): Promise<number | null> {
        throw new Error("Not implemented");
    }

    seek(offset: number | bigint, whence?: SeekMode | undefined): Promise<number> {
        throw new Error("Not implemented");
    }

    seekSync(offset: number | bigint, whence?: SeekMode): number {
        throw new Error("Not implemented");
    }

    stat(): Promise<FileInfo> {
        throw new Error("Not implemented");
    }

    statSync(): FileInfo {
        throw new Error("Not implemented");
    }

    writeSync(buffer: Uint8Array): number {
        throw new Error("Not implemented");
    }

    write(buffer: Uint8Array): Promise<number> {
        throw new Error("Not implemented");
    }

    unlock(): Promise<void> {
        throw new Error("Not implemented");
    }

    unlockSync(): void {
        throw new Error("Not implemented");
    }
}
