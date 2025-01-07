

export interface DownloaderParams {
    signal?: AbortSignal;
    retry?: number;
}

export enum DownloadFeatures {
    download = "download",
    pipeDownload = "pipeDownload",
    retries = "retries",
}

export interface DownloaderDriver {
 
    hasFeature(feature: DownloadFeatures): boolean;

    download(url: string, dest: string, options?: DownloaderParams): Promise<void>;

    pipeDownload(url: string, dest: string, options?: DownloaderParams): Promise<void>;
}

export class DownloaderRegistry extends Map<string, DownloaderDriver> {

}

const g = globalThis as Record<string | symbol, unknown>;

export const DownloaderRegistrySymbol = Symbol("@DOWNLOADER_REGISTRY");

if (!g[DownloaderRegistrySymbol]) {
    g[DownloaderRegistrySymbol] = new DownloaderRegistry();
}

export function getDownloaderRegistry(): DownloaderRegistry {
    return g[DownloaderRegistrySymbol] as DownloaderRegistry;
}
