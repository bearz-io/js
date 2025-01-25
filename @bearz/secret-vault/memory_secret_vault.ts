import type {
    GetSecretParams,
    SecretOperationParams,
    SecretProperties,
    SecretRecord,
    SecretVaultClient,
    SecretVaultFeatures,
} from "./types.ts";
import { normalizeKey } from "./utils.ts";
import {
    type ProviderFactory,
    type ProviderFactoryConfig,
    toProviderFactoryConfig,
} from "@bearz/di";
import { abort, fail, ok, type Result, voided } from "@bearz/functional";
import { NotFoundError } from "@bearz/errors/not-found";
import { secretVaultClients } from "./registries.ts"

/**
 * The memory secret vault.
 */
export class MemorySecretVaultClient implements SecretVaultClient {
    #data = new Map<string, SecretRecord>();
    #history = new Map<string, Map<string, SecretRecord>>();


    /**
     * Determines if the vault supports a feature.
     * @param feature The feature to check.
     * @returns `true` if the feature is supported, otherwise `false`.
     */
    supports(feature: SecretVaultFeatures): boolean {
        switch (feature) {
            case "prop:tags":
            case "prop:expires":
            case "prop:created":
            case "prop:enabled":
            case "prop:version":
            case "properties":
            case "list":
            case "list:names":
                return true;

            default:
                return false;
        }
    }

    /**
     * Gets a secret from the vault.
     * @param name The name of the secret.
     * @param params The parameters to get the secret.
     * @returns The secret record, or undefined if the secret does not exist.
     */
    getSecret(name: string, params?: GetSecretParams): Promise<Result<SecretRecord>> {
        if (params?.signal?.aborted) {
            return Promise.reject(abort(params.signal));
        }

        const n = normalizeKey(name);

        if (!params || !params.version) {
            const record = this.#data.get(n);
            if (!record) {
                return Promise.resolve(fail(new NotFoundError(name)));
            }

            return Promise.resolve(ok(record));
        }

        const history = this.#history.get(n);
        if (!history) {
            return Promise.resolve(fail(new NotFoundError(name)));
        }

        const record = history.get(params.version);
        if (!record) {
            return Promise.resolve(fail(new NotFoundError(name)));
        }

        return Promise.resolve(ok(record));
    }

    /**
     * Gets the value of a secret from the vault.
     * @param name The name of the secret.
     * @param params The parameters to get the secret.
     * @returns The value of the secret, or undefined if the secret does not exist.
     */
    getSecretValue(name: string, params?: GetSecretParams) {
        return this.getSecret(name, params).then((res) => res.map((r) => r.value ?? ""));
    }

    /**
     * Gets the names of the secrets in the vault.
     * @param params The parameters to use when listing the secret names.
     * @returns The names of the secrets in the vault.
     */
    listSecretNames(params?: SecretOperationParams): Promise<Result<string[]>> {
        return this.listSecrets(params).then((res) => res.map((r) => r.map((s) => s.name)));
    }

    /**
     * Gets the secrets in the vault.
     * @param params The parameters to use when listing the secrets.
     * @returns The secret records.
     */
    listSecrets(params?: SecretOperationParams): Promise<Result<SecretRecord[]>> {
        if (params?.signal?.aborted) {
            return Promise.reject(abort(params.signal));
        }

        const records = Array.from(this.#data.values());
        return Promise.resolve(ok(records));
    }

    /**
     * Sets the value of a secret in the vault.
     * @param name The name of the secret.
     * @param value The value of the secret.
     * @param params The parameters for the operation.
     */
    setSecret(name: string, value: string, params?: SecretOperationParams): Promise<Result<void>> {
        if (params?.signal?.aborted) {
            return Promise.reject(abort(params.signal));
        }

        const n = normalizeKey(name);
        const existing = this.#data.get(n);
        if (existing) {
            if (existing.value !== value) {
                const history = this.#history.get(n) || new Map<string, SecretRecord>();
                history.set(existing.version!, existing);
                this.#history.set(n, history);

                const record = { ...existing, value: value, version: crypto.randomUUID() };
                record.version = crypto.randomUUID();
                this.#data.set(n, record);
            }

            return Promise.resolve(voided());
        }

        const r: SecretRecord = { name: name, value: value, version: crypto.randomUUID() };
        this.#data.set(n, r);
        return Promise.resolve(voided());
    }

    /**
     * Deletes a secret from the vault by its name.
     * @param name The name of the secret to delete.
     * @param params The parameters for the operation.
     */
    deleteSecret(name: string, params?: SecretOperationParams): Promise<Result<void>> {
        if (params?.signal?.aborted) {
            return Promise.reject(abort(params.signal));
        }

        const n = normalizeKey(name);
        this.#data.delete(n);
        return Promise.resolve(voided());
    }

    /**
     * Updates the properties of a secret in the vault.
     * @param name The name of the secret.
     * @param properties The properties to update.
     * @param params The parameters for the operation.
     */
    upateSecretProperties(
        name: string,
        properties: SecretProperties,
        params?: SecretOperationParams,
    ): Promise<Result<void>> {
        if (params?.signal?.aborted) {
            return Promise.reject(abort(params.signal));
        }

        const n = normalizeKey(name);
        let record = this.#data.get(n);

        if (record && properties.value !== undefined && properties.value !== record.value) {
            const history = this.#history.get(n) || new Map<string, SecretRecord>();
            history.set(record.version!, record);
            this.#history.set(n, history);

            record = { ...record, value: properties.value, version: crypto.randomUUID() };
        }

        if (!record) {
            record = { name: name, value: "", version: crypto.randomUUID() };
        }

        for (const key in properties) {
            record[key] = properties[key];
        }

        this.#data.set(n, record);
        return Promise.resolve(voided());
    }
}

export class MemoryVaultClient extends MemorySecretVaultClient {
    constructor(name: string) {
        super();
        this.name = name;
    }
}

/**
 * Creates a new memory secret vault client.
 * @param name The name of the vault.
 * @returns The memory secret vault client.
 */
export function createMemoryClient(name: string): MemorySecretVaultClient {
    return new MemorySecretVaultClient(name);
}

/**
 * The configuration for the memory secret vault factory.
 */
export interface MemorySecretVaultFactoryConfig extends ProviderFactoryConfig {
    kind: "secret-vault";
    use: "memory" | "@bearz/vaults/memory" | "@bearz/vaults@latest/memory";
    with?: {
        "factory-path": string | undefined;
    } | Record<string, unknown>;
}

/**
 * The factory for the memory secret vault.
 */
export class MemorySecretVaultFactory implements ProviderFactory {
    /**
     * Determines if the factory can create a client.
     * @param params The parameters for the factory.
     * @returns True if the factory can create a client, otherwise false. 
     */
    match(params: ProviderFactoryConfig): boolean {
        if (params.kind !== "secret-vault") {
            return false;
        }

        const imports: string[] = ["@bearz/vaults/memory", "@bearz/vaults@latest/memory", "memory"];

        return (imports.includes(params.use) ||
            (params.import !== undefined && imports.includes(params.import)));
    }

    /**
     * The factory creates a client.
     * @param params The parameters for the factory.
     * @returns The created client.
     */
    create(params: ProviderFactoryConfig): SecretVaultClient {
        const config = toProviderFactoryConfig(params) as MemorySecretVaultFactoryConfig;

        return new MemorySecretVaultClient(config.name);
    }
}

/**
 * The factory for the memory secret vault.
 */
export const factory = new MemorySecretVaultFactory();

export interface DefineMemorySecretVault extends Record<string, unknown> {
    name: string;
    with?: {
        "factory-path": string | undefined;
    } | Record<string, unknown>;
}

export function defineMemorySecretVault(config: DefineMemorySecretVault): Result<MemorySecretVaultClient> {
    const f = { ...config, kind: "secret-vault", use: "memory" } as MemorySecretVaultFactoryConfig;
    const vault = secretVaultClients().define(f, false);
    return vault as Result<MemorySecretVaultClient>;
}

defineMemorySecretVault({
    name: "memory",
    with: {
        'factory-path': undefined,
    }
})