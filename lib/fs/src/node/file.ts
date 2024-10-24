import { basename } from "@std/path";
import type { FileInfo, FsSupports, SeekMode } from "../types.ts";
import fs from "node:fs";
import { BaseFile } from "../base_file.ts";
import  { ext } from "./ext.ts";



const defaultSupports: FsSupports[] = [];


export class File extends BaseFile {
    #fd: number;
    #path: string;
    #supports: FsSupports[] = [];
    #readable?: ReadableStream<Uint8Array>;
    #writeable?: WritableStream<Uint8Array>;

    constructor(fd: number, path: string, supports: FsSupports[] = []) {
        super();
        this.#fd = fd;
        this.#path = path;
        this.#supports = supports.concat(defaultSupports);
    }    

    override get readable(): ReadableStream<Uint8Array> {
        const fd = this.#fd;
        this.#readable ??= new ReadableStream({
            start: (controller) => {
                while (true) {
                    const buf = new Uint8Array(1024);
                    const size = this.readSync(buf);
                    if (size === null) {
                        controller.close();
                        this.closeSync();
                        break;
                    }
                    controller.enqueue(buf.slice(0, size));
                }
            },
            cancel() {
                fs.closeSync(fd);
            },
        });

        return this.#readable;
    }

    override get writeable(): WritableStream<Uint8Array> {
        const fd = this.#fd;
        this.#writeable ??= new WritableStream({
            write(chunk, controller) {
                return new Promise((resolve) => {
                    fs.write(fd, chunk, (err) => {
                        if (err) {
                            controller.error(err);
                            return;
                        }

                        resolve();
                    });
                });
            },
            close() {
                fs.closeSync(fd);
            },
        });

        return this.writeable;
    }

    override get supports(): FsSupports[] {
        return this.#supports;
    }

    override closeSync(): void {
        fs.closeSync(this.#fd);
    }

    override close(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.close(this.#fd, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    override flush(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.fsync(this.#fd, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    override flushSync(): void {
        fs.fsyncSync(this.#fd);
    }

    override flushData(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.fdatasync(this.#fd, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    override flushDataSync(): void {
        return fs.fdatasyncSync(this.#fd);
    }

    override lock(exclusive?: boolean | undefined): Promise<void> {
        return ext.lockFile(this.#fd, exclusive);
    }

    override lockSync(exclusive?: boolean | undefined): void {
        return ext.lockFileSync(this.#fd, exclusive);
    }

    override readSync(p: Uint8Array): number | null {
        const v = fs.readSync(this.#fd, p);
        if (v < 1) {
            return null;
        }

        return v;
    }

    override read(p: Uint8Array): Promise<number | null> {
        return new Promise((resolve, reject) => {
            fs.read(this.#fd, p, 0, p.length, null, (err, size) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(size);
            });
        });
    }

    override seekSync(offset: number | bigint, whence?: SeekMode | undefined): number {
        return ext.seekFileSync(this.#fd, offset, whence);
    }

    override seek(offset: number | bigint, whence?: SeekMode | undefined): Promise<number> {
        return ext.seekFile(this.#fd, offset, whence);
    }

    override stat(): Promise<FileInfo> {
        return new Promise((resolve, reject) => {
            fs.fstat(this.#fd, (err, stat) => {
                if (err) {
                    reject(err);
                    return;
                }

                const p = this.#path;
                resolve({
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
                } as FileInfo);
            });
        });
    }

    override statSync(): FileInfo {
        const p = this.#path;
        const stat = fs.fstatSync(this.#fd);
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
    }

    override writeSync(p: Uint8Array): number {
        return fs.writeSync(this.#fd, p);
    }

    override write(p: Uint8Array): Promise<number> {
        return new Promise((resolve, reject) => {
            fs.write(this.#fd, p, (err, size) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(size);
            });
        });
    }

    override unlock(): Promise<void> {
        return ext.unlockFile(this.#fd);
    }

    override unlockSync(): void {
        return ext.unlockFileSync(this.#fd);
    }
}