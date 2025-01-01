import { env } from "@bearz/env";
import type { SecretsVaultConfigLoader, SecretVault, VaultDef } from "@rex/vaults/types";
import type { SopsVaultParams } from "./vault.ts";
import { SopsVault } from "./vault.ts";
import { isAbsolute, resolve } from "@std/path";


export class SopsCliLoader implements SecretsVaultConfigLoader {
    canHandle(url: URL): boolean {
        return url.protocol === "sops-cli:";
    }

    load(config: VaultDef): SecretVault {
        const url = new URL(config.uri);
        let sopsFile = url.pathname;
        if (url.host == "." || url.host == "..") {
            sopsFile = url.host + sopsFile;
        }

        let recipients = url.searchParams.get("age-recipients") ?? ""
        let sopsKeyFile = url.searchParams.get("age-key-file") ?? ""
        let configFile = url.searchParams.get("sops-config") ?? ""
        const driver = url.searchParams.get("driver") ?? "age"

        if (recipients.length === 0) {
            if (config.with && config.with["age-recipients"]) {
                recipients = config.with["age-recipients"] as string;
            }
        }

        if (recipients === "") {
            recipients = env.get("SOPS_AGE_RECIPIENTS") ?? "";
        }

        if (sopsKeyFile.length === 0) {
            if (config.with && config.with["age-key-file"]) {
                sopsKeyFile = config.with["age-key-file"] as string;
            }
        }

        if (configFile.length === 0) {
            if (config.with && config.with["sops-config"]) {
                configFile = config.with["sops-config"] as string;
            }
        }

        if (sopsFile.length === 0) {
            if (config.with && config.with["file"]) {
                sopsFile = config.with["file"] as string;
            }
        }

        if (sopsFile.length === 0) {
            throw new Error("Sops file not specified");
        }

        if (!isAbsolute(sopsFile)) {
            sopsFile = resolve(sopsFile);
        }

        if (sopsKeyFile.length == 0) {
            throw new Error("Sops file not specified");
        }

        const params : SopsVaultParams = {
            autoSave: true,
            name: config.name,
            path: sopsFile,
            driver: driver as "age",
        }

        if (sopsKeyFile.length > 0) {
            params.driver = "age";
            params.age ??= {};
            params.age.keyFile = sopsKeyFile;
            env.set("SOPS_AGE_KEY_FILE", sopsKeyFile);
        }

        if (recipients.length > 0) {
            params.age ??= {};
            params.age.recipients = recipients;
        }

        return new SopsVault(params);
    }
}

export const loader = new SopsCliLoader();