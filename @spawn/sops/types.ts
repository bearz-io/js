import type { SecretRecord } from "@bearz/secret-vault/types";

export interface DocumentSerializer {
    serialize(document: VaultDocument): string;
    deserialize(serialized: string): VaultDocument;
}

export interface VaultDocument {
    name: string;
    secrets: SecretRecord[];
    history: {
        [key: string]: SecretRecord[];
    };
}
