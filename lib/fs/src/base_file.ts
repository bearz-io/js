// deno-lint-ignore-file no-unused-vars
import type { FileInfo, FsFile, FsSupports, SeekMode } from "./types.ts";

export abstract class BaseFile implements FsFile {
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
