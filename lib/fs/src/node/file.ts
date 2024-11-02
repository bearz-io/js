import { basename } from "@std/path";
import type { FileInfo, FsSupports, SeekMode } from "../types.ts";
import fs from "node:fs";
import { BaseFile } from "../base_file.ts";
import { ext } from "./ext.ts";

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

    /**
     * The readable stream for the file.
     */
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

    /**
     * The writeable stream for the file.
     */
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

    /**
     * Provides information about the file system support for the file.
     */
    override get supports(): FsSupports[] {
        return this.#supports;
    }
    /**
     * Synchronously closes the file.
     */
    override closeSync(): void {
        fs.closeSync(this.#fd);
    }

    /**
     * Closes the file.
     * @returns A promise that resolves when the file is closed.
     */
    override close(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.close(this.#fd, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    /**
     * Flushes any pending data and metadata operations
     * of the given file stream to disk.
     * @returns A promise that resolves when the data is flushed.
     */
    override flush(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.fsync(this.#fd, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    /**
     * Synchronously flushes any pending data and metadata operations
     * of the given file stream to disk.
     */
    override flushSync(): void {
        fs.fsyncSync(this.#fd);
    }

    /**
     * Flushes any pending data operations of
     * the given file stream to disk.
     * @returns A promise that resolves when the data is flushed.
     */
    override flushData(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.fdatasync(this.#fd, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    /**
     * Synchronously flushes any pending data operations of
     * the given file stream to disk.
     * @returns
     */
    override flushDataSync(): void {
        return fs.fdatasyncSync(this.#fd);
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
        return ext.lockFile(this.#fd, exclusive);
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
        return ext.lockFileSync(this.#fd, exclusive);
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
        const v = fs.readSync(this.#fd, buffer);
        if (v < 1) {
            return null;
        }

        return v;
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
    override seekSync(offset: number | bigint, whence?: SeekMode | undefined): number {
        return ext.seekFileSync(this.#fd, offset, whence);
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
        return ext.seekFile(this.#fd, offset, whence);
    }

    /**
     * Gets the file information for the file.
     * @returns A file information object.
     * @throws An error if the file information cannot be retrieved.
     */
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

    /**
     * Synchronously gets the file information for the file.
     * @returns A file information object.
     * @throws An error if the file information cannot be retrieved.
     */
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
        return fs.writeSync(this.#fd, buffer);
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

    /**
     * Release an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @returns A promise that resolves when the lock is released.
     * @throws An error if not implemented.
     */
    override unlock(): Promise<void> {
        return ext.unlockFile(this.#fd);
    }

    /**
     * Release an advisory file-system lock for the file.
     * **The current runtime may not support this operation or may require
     * implementation of the `lock` and `unlock` methods.**
     * @throws An error if not implemented.
     */
    override unlockSync(): void {
        return ext.unlockFileSync(this.#fd);
    }
}
