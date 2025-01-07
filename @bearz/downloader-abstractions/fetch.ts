import {  open } from "@bearz/fs";
import { DownloaderParams, DownloadFeatures } from "./registry.ts";

export class FetchDownloadDriver {
    constructor() {
    }
    hasFeature(_ : DownloadFeatures) : boolean {
        return true;
    }
    
    async download(url: string, dest: string, options?: DownloaderParams) : Promise<void> {
        const response = await fetch(url, {
            signal: options === null || options === void 0 ? void 0 : options.signal
        });
        if (!response.ok) {
            throw new Error(`Failed to download file from ${url}.`);
        }
        
        if (response.ok && response.body) {
            const file = await open(dest, { write: true, create: true });
            const stream = file.writeable;
            await response.body.pipeTo(stream);
        }    
    }

}