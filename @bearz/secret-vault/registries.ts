import type { SecretVaultClient } from "./types.ts";
import { MemorySecretVaultFactory } from "./memory_secret_vault.ts";
import { coerceError, ok, type Result } from "@bearz/functional";
import {
    createDynamicProvider,
    createProvider,
    getServices,
    type ProviderFactoryConfigParams,
    registerProviderFactory,
    toProviderFactoryConfig,
} from "@bearz/di";

const services = getServices();

const f = new MemorySecretVaultFactory();

registerProviderFactory("secret-vault://memory", f);
registerProviderFactory("@bearz/secret-vault@latest/memory", f);
registerProviderFactory("@bearz/secret-vault/memory", f);

/**
 * The secret vault clients collection/registry.
 */
export class SecretVaultClients extends Map<string, SecretVaultClient> {

    /**
     * Finds a secret vault client by its parameters.
     * @param params The parameters to find the client.
     * @returns The secret vault client, or undefined if not found.
     */
    findByParams(params: ProviderFactoryConfigParams): SecretVaultClient | undefined {
        try {
            params = toProviderFactoryConfig(params);

            return this.get(params.name);
        } catch (_) {
            return undefined;
        }
    }

    /**
     * Defines a secret vault client by its parameters.
     * @param params The parameters to define the client.
     * @param overwrite Recreate the client if it already exists.
     * @returns The secret vault client, or an error if not found.
     */
    define(params: ProviderFactoryConfigParams, overwrite = false): Result<SecretVaultClient> {
        try {
            params = toProviderFactoryConfig(params);

            if (this.has(params.name) && !overwrite) {
                return ok(this.get(params.name)!);
            }

            const res = createProvider<SecretVaultClient>(params);
            if (res.isError) {
                return res;
            }

            this.set(params.name, res.unwrap());
            return res;
        } catch (e) {
            return coerceError(e);
        }
    }

    /**
     * Defines a secret vault client by its parameters. If the client is
     * not loaded, this method will attempt to load the client implementation
     * from a module dynamically and then create the vault.
     * @param params The parameters to define the client.
     * @param overwrite Overwrite the client if it already exists.
     * @returns The secret vault client, or an error if not found.
     */
    async dynamicDefine(
        params: ProviderFactoryConfigParams,
        overwrite = false,
    ): Promise<Result<SecretVaultClient>> {
        params = toProviderFactoryConfig(params);

        if (this.has(params.name) && !overwrite) {
            return ok(this.get(params.name)!);
        }

        const res = await createDynamicProvider<SecretVaultClient>(params);
        if (res.isError) {
            return res;
        }

        this.set(params.name, res.unwrap());
        return res;
    }
}

/**
 * Gets the global secret vault clients collection/registry.
 * @returns The secret vault clients collection/registry.
 */
export function secretVaultClients(): SecretVaultClients {
    const key = "SECRET_VAULT_CLIENTS";
    let clients = services.get<SecretVaultClients>(key)!;
    if (!clients) {
        clients = new SecretVaultClients();
        services.set(key, clients);
    }

    return clients;
}
