import type { SecretsVaultFactory, SecretVault, SecretVaultParams } from "./types.ts";

const g = globalThis as Record<string | symbol, unknown>;
export const REX_VAULTS_REGISTRY = Symbol.for("@@REX_VAULTS_REGISTRY");
export const REX_VAULTS = Symbol.for("@@REX_VAULTS");

if (!g[REX_VAULTS]) {
    g[REX_VAULTS] = new Map<string, SecretVault>();
}

export function getVaults(): Map<string, SecretVault> {
    return g[REX_VAULTS] as Map<string, SecretVault>;
}

export class SecretVaultRegistry extends Map<string, SecretsVaultFactory> {


    async build(params: SecretVaultParams): Promise<SecretVault> {
        let { use } = params;
        const { uri } = params;

        if (!use && !uri) {
            use = "@rex/vaults-json";
        } else if (!use && uri) {
            const url = new URL(uri);
            const scheme = url.protocol.replace(":", "");
            let org = "rex";
            let moduleName = "vaults-" + scheme;
            if (scheme.includes("--")) {
                const parts = scheme.split("--");
                org = parts[0];
                moduleName = parts[1];
            }

            use = `@${org}/${moduleName}`;
        } else if (use) {
            if (!use.startsWith("@")) {
                use = `@rex/vaults-${use}`;
            }
        }
        
        if (!registry.has(use!)) {
            const importDirective = `jsr:${use}/factory`;
            const mod = await import(importDirective) as { factory: SecretsVaultFactory };
            registry.set(use!, mod.factory);
        }

        const factory = registry.get(use!);   
        if (!factory) {
            throw new Error(`Secrets vault loader ${use} not found`);
        }
       
        return factory.build(params);
    }

    async buildAndRegister(params: SecretVaultParams): Promise<SecretVault> {
        const vault = await this.build(params);
        vaults.set(params.name, vault);
        return vault;
    }

    async getOrCreate(params: SecretVaultParams): Promise<SecretVault> {
        const vault = vaults.get(params.name);
        if (vault) {
            return vault;
        }

        return await this.buildAndRegister(params);
    }
}

const registry = new Map<string, SecretsVaultFactory>();
const vaults = new Map<string, SecretVault>();

if (!g[REX_VAULTS_REGISTRY]) {
    g[REX_VAULTS_REGISTRY] =  new SecretVaultRegistry();
}

export function getVaultsRegistry(): SecretVaultRegistry {
    return g[REX_VAULTS_REGISTRY] as SecretVaultRegistry
}

