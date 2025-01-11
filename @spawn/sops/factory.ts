import {
    type ProviderFactory,
    type ProviderFactoryConfig,
    registerProviderFactory,
} from "@bearz/di";
import { SpawnSopsSecretVaultClient, type SpawnSopsSecretVaultClientParams } from "./client.ts";
import type { SecretVaultClient } from "@bearz/secret-vault/types";

export interface SpawnSopsSecretVaultClientFactoryConfig extends ProviderFactoryConfig {
    use: "spawn-sops" | "@spawn/sops" | "@spawn/sops@latest";
    kind: "secret-vault";
    with?: {
        "file": string;
        "config": string | undefined;
        "age-key": string | undefined;
        "age-key-file": string | undefined;
        "age": string | undefined;
        "kms": string | undefined;
        "azure-kv": string | undefined;
        "gcp-kms": string | undefined;
        "hc-vault-transit": string | undefined;
        "auto-save": boolean | undefined;
        "cwd": string | undefined;
    } | Record<string, unknown>;
}

export class SpawnSopsSecretVaultClientFactory implements ProviderFactory {
    match(params: ProviderFactoryConfig): boolean {
        if (params.kind !== "secret-vault") {
            return false;
        }

        const imports = ["spawn-sops", "@spawn/sops", "@spawn/sops@latest"];
        return (imports.includes(params.name) ||
            (params.import !== undefined && imports.includes(params.import)));
    }

    create(params: ProviderFactoryConfig): SecretVaultClient {
        const o: SpawnSopsSecretVaultClientParams = {
            file: params.with?.file as string,
            name: params.name,
            backupDir: params.with?.["backup-dir"] as string | undefined,
            age: {
                key: params.with?.["age-key"] as string | undefined,
                keyFile: params.with?.["age-key-file"] as string | undefined,
                recipients: params.with?.["age"] as string | undefined,
            },
            aws: { arns: params.with?.["kms"] as string | undefined },
            azure: { uri: params.with?.["azure-kv"] as string | undefined },
            vault: { uri: params.with?.["hc-vault-transit"] as string | undefined },
            gcp: { uri: params.with?.["gcp-kms"] as string | undefined },
            autoSave: params.with?.["auto-save"] as boolean | undefined,
            config: params.with?.config as string | undefined,
            cwd: params.with?.cwd as string | undefined,
            pgp: { fingerprints: params.with?.["pgp"] as string | undefined },
        };

        return new SpawnSopsSecretVaultClient(o);
    }
}

/**
 * The global factory for creating Spawn Sops secret vault clients.
 */
export const factory = new SpawnSopsSecretVaultClientFactory();
registerProviderFactory("secret-vault://spawn-sops", factory);
registerProviderFactory("@spawn/sops", factory);
registerProviderFactory("@spawn/sops@latest", factory);
