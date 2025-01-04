import type { SecretsVaultFactory, SecretVault, SecretVaultParams } from "@rex/vaults/types";
import type { SopsProvider, SopsVaultParams } from "./vault.ts";
import { SopsVault } from "./vault.ts";
import { isAbsolute, resolve } from "@std/path";

export class SopsCliFactory implements SecretsVaultFactory {
    canBuild(params: SecretVaultParams): boolean {
        return (params.use !== undefined && (params.use === "@rex/vaults-sops-cli" || params.use === "sops-cli")) 
            || (params.uri !== undefined && params.uri.startsWith("sops-cli:"));
    }

    build(config: SecretVaultParams): SecretVault {
        const { uri } = config;
        const w = config.with;

        let recipients : string | undefined = undefined;
        let sopsKeyFile : string | undefined = undefined;
        let configFile : string | undefined = undefined;
        let driver : SopsProvider = "age";
        let path : string = "";

        if (uri) {
            const url = new URL(uri);
            path = url.pathname;
            if (url.host == "." || url.host == "..") {
                path = url.host + path;
            }

            const r = url.searchParams.get("age-recipients");
            if (r) {
                recipients = r;
            }
            
            const k = url.searchParams.get("age-key-file");
            if (k) {
                sopsKeyFile = k;
            }

            const c = url.searchParams.get("sops-config");
            if (c) {
                configFile = c;
            }
           
            const d = url.searchParams.get("driver");
            if (d) {
                driver = d as SopsProvider;
            }
        }

        if (w) {
            if (w.use) {
                driver = w.use as SopsProvider;
            }
          
            if (w["age-recipients"]) {
                recipients = w["age-recipients"] as string;
            }

            if (w["age-key-file"]) {
                sopsKeyFile = w["age-key-file"] as string;
            }

            if (w["sops-config"]) {
                configFile = w["sops-config"] as string;
            }

            if (w["file"]) {
                path = w["file"] as string;
            }
        }

        if (path.length === 0) {
            throw new Error("Sops file not specified");
        }

        if (!isAbsolute(path)) {
            path = resolve(path);
        }

        const params: SopsVaultParams = {
            autoSave: true,
            name: config.name,
            path,
            driver,
            config: configFile,
        };

        if (sopsKeyFile?.length !== 0) {
            params.age ??= {};
            params.age.keyFile = sopsKeyFile;
        }
        
        if (recipients?.length !== 0) {
            params.age ??= {};
            params.age.recipients = recipients;
        }

        return new SopsVault(params);
    }
}

export const loader = new SopsCliFactory();
