import { basename } from "@std/path";
import type { FileInfo, FsSupports, SeekMode } from "../types.ts";
import { BaseFile } from "../base_file.ts";

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

export class File extends BaseFile {
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

    override get readable(): ReadableStream<Uint8Array> {
        return this.#file.readable;
    }

    override get writeable(): WritableStream<Uint8Array> {
        return this.#file.writable;
    }

    override get supports(): FsSupports[] {
        return this.#supports;
    }

    override close(): Promise<void> {
        return Promise.resolve(this.#file.close());
    }

    override closeSync(): void {
        this.#file.close();
    }

    override flush(): Promise<void> {
        return this.#file.sync();
    }

    override flushSync(): void {
        return this.#file.syncSync();
    }

    override flushData(): Promise<void> {
        return this.#file.syncData();
    }

    override flushDataSync(): void {
        return this.#file.syncDataSync();
    }

    override lock(exclusive?: boolean | undefined): Promise<void> {
        return this.#file.lock(exclusive);
    }

    override lockSync(exclusive?: boolean | undefined): void {
        return this.#file.lockSync(exclusive);
    }

    override readSync(buffer: Uint8Array): number | null {
        return this.#file.readSync(buffer);
    }

    override read(buffer: Uint8Array): Promise<number | null> {
        return this.#file.read(buffer);
    }

    override seek(offset: number | bigint, whence?: SeekMode | undefined): Promise<number> {
        return this.#file.seek(offset, translate(whence));
    }

    override seekSync(offset: number | bigint, whence?: SeekMode): number {
        return this.#file.seekSync(offset, translate(whence));
    }

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

    override writeSync(buffer: Uint8Array): number {
        return this.#file.writeSync(buffer);
    }

    override write(buffer: Uint8Array): Promise<number> {
        return this.#file.write(buffer);
    }

    override unlock(): Promise<void> {
        return this.#file.unlock();
    }

    override unlockSync(): void {
        this.#file.unlockSync();
    }
}