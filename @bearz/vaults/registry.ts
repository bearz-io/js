import { MemorySecretVaultFactory } from "./memory_secret_vault.ts";
import type { SecretsVaultFactory, SecretVault, SecretVaultParams } from "./types.ts";


/**
 * Represents a collection of secret vaults.
 */
export class SecretVaultRegistry extends Map<string, SecretVault> {

}

let registry = new SecretVaultRegistry();
const registrySymbol = Symbol.for("@@BEARZ_SECRETS_VAULTS_REGISTRY");
const g = globalThis as Record<string | symbol, unknown>;

/**
 * Gets the secret vault registry to use for the application. The registry
 * @returns The secret vault registry to use for the application.
 */
export function secretVaults() : SecretVaultRegistry {
    if (g[registrySymbol]) {
        return g[registrySymbol] as SecretVaultRegistry;
    }

    return registry;
}

/**
 * Gets the secret vault registry to use for the application. The registry
 * result can be used to register, find, and retrieve secret vaults.
 * 
 * @param secretVaultRegistry The secret vault registry to use.
 * @param global Determines if the registry should be set globally. 
 */
export function useSecretVaultsRegistry(secretVaultRegistry: SecretVaultRegistry, global = false) {
    if (global) {
        g[registrySymbol] = secretVaultRegistry;
    }

    registry = secretVaultRegistry;
}

/**
 * Represents the options to use when building a secret vault.
 */
export interface SecretVaultBuildOptions {
    /**
     * Determines if the secret vault should be registered with the secret vault registry.
     */
    register?: boolean;
    /**
     * Determines if the secret vault should be built even if it is already registered.
     */
    force?: boolean;
    /**
     * Determines if the secret vault should be matched with the secret vault factories if the
     * use or uri is not provided or does not match a factory.
     */
    match?: boolean;
}

/**
 * A collection of secret vault factories that can be used to build secret vaults or
 * secret vault clients.
 */
export class SecretVaultFactories extends Map<string, SecretsVaultFactory> {

    defaultOrg = "bearz";


    match(params: SecretVaultParams): SecretsVaultFactory | undefined {
        for(const [_, value] of this.entries()) {
            if (value.match(params)) {
                return value;
            }
        }

        return undefined;
    }

    /**
     * Builds a secret vault and optionally registers it using the parameters provided. If register is true
     * and force is false, the existing secret vault will be returned if it is already registered.
     * @param params The parameters to build the secret vault.
     * @param options The options to use when building the secret vault.
     * @returns The secret vault.
     */
    async build(params: SecretVaultParams, options?: SecretVaultBuildOptions): Promise<SecretVault> {
        const name = params.name;

        options ??= { match: true };

        if (!options.force && options.register) {
            const vaults = secretVaults();
            if (vaults.has(name)) {
                return vaults.get(name)!;
            }
        }

        const { use, uri } = params;
        let factoryKey = "";

        if (!use && !uri) {
            factoryKey = "memory";
        } else if (!use && uri) {
            const url = new URL(uri);

            const driver = url.searchParams.get("use");
            if (driver) {
                factoryKey = driver;
            } else {
                const scheme = url.protocol.replace(":", "");
                let org = this.defaultOrg;
                let moduleName = "vaults-" + scheme;
                if (scheme.includes("--")) {
                    const parts = scheme.split("--");
                    org = parts[0];
                    moduleName = parts[1];
                }
    
                factoryKey = `@${org}/${moduleName}@latest`;
            }
        } else {
            factoryKey = use!;
        }

        if (!this.has(factoryKey)) {
            let found = false;
            if (options.match) {
                for(const [key, value] of this.entries()) {
                    if (value.match(params)) {
                        factoryKey = key;
                        found = true;
                        break;
                    }
                }
            }
          
            if (!found) {
                const factoryPath = params.with?.factoryPath ?? "factory";
                let importDirective = `${factoryKey}/${factoryPath}`;
                if (g.Deno && !use!.includes(":")) {
                    importDirective = `jsr:${importDirective}`;
                }
    
                const mod = await import(importDirective) as { factory: SecretsVaultFactory };
                if (factoryKey.endsWith("@latest")) {
                    this.set(factoryKey.replace("@latest", ""), mod.factory);
                } else {
                    this.set(factoryKey, mod.factory);
                }
            }
        }

        const factory = this.get(factoryKey);
        if (!factory) {
            throw new Error(`factory not found for '${factoryKey}'.`);
        }

        const instance = factory.build(params);
        if (options.register) {
            const vaults = secretVaults();
            vaults.set(params.name, instance);
        }

        return instance;
    }
}

const secretVaultsSymbol = Symbol.for("@@BEARZ_SECRETS_VAULTS_FACTORIES");
let factories = new SecretVaultFactories();
factories.set("memory", new MemorySecretVaultFactory());

/**
 * Gets the secret vault factories to use for the application. The factories 
 * result can be used to build secret vaults.
 * @returns The secret vault factories.
 */
export function secretVaultFactories() : SecretVaultFactories {
    if (g[secretVaultsSymbol]) {
        return g[secretVaultsSymbol] as SecretVaultFactories;
    }
    
    return factories;
}

/**
 * Sets the secret vault factories to use for the application.
 * @param secretVaultFactories The secret vault factories to use.
 * @param global Determines if the factories should be set globally.
 */
export function useSecretVaultsFactories(secretVaultFactories: SecretVaultFactories, global = false) {
    if (global) {
        g[secretVaultsSymbol] = secretVaultFactories;
    }

    factories = secretVaultFactories;
}