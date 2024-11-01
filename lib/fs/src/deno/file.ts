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
