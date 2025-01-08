import { Result } from "@bearz/functional";

export interface DownloaderOptions extends Record<string | symbol, unknown> {
    signal?: AbortSignal;
    retry?: number;
    dest?: string;
}

export interface Downloader {
    download(src: string, options?: DownloaderOptions): Promise<Result<string>>;
}

export const DownloaderRegistrySymbol = Symbol("@DOWNLOADER_REGISTRY");

export class DownloaderRegistry extends Map<string, Downloader> {
}

const g = globalThis as Record<string | symbol, unknown>;

if (!g[DownloaderRegistrySymbol]) {
    g[DownloaderRegistrySymbol] = new DownloaderRegistry();
}

export function getDownloaderRegistry(): DownloaderRegistry {
    return g[DownloaderRegistrySymbol] as DownloaderRegistry;
}

export function download(src: string, options?: DownloaderOptions): Promise<Result<string>> {
    const registry = getDownloaderRegistry();
    const downloader = registry.get("default");

    if (!downloader) {
        throw new Error("No downloader found.");
    }

    return downloader.download(src, options);
}
