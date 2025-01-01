import type { ExecutionContext } from "@rex/primitives";
import type { SecretsPartialConfig, SecretsVaultConfigLoader, SecretVault } from "./types.ts";
import { DefaultSecretGenerator } from "@bearz/secrets/generator";

const registry = new Map<string, SecretsVaultConfigLoader>();
const vaults = new Map<string, SecretVault>();
const g = globalThis as Record<string | symbol, unknown>;
export const REX_VAULTS_REGISTRY = Symbol.for("@@REX_VAULTS_REGISTRY");
export const REX_VAULTS = Symbol.for("@@REX_VAULTS");

if (!g[REX_VAULTS_REGISTRY]) {
    g[REX_VAULTS_REGISTRY] = registry;
}

if (!g[REX_VAULTS]) {
    g[REX_VAULTS] = vaults;
}

export function getRegistry(): Map<string, SecretsVaultConfigLoader> {
    return g[REX_VAULTS_REGISTRY] as Map<string, SecretsVaultConfigLoader>;
}

export function getVaults(): Map<string, SecretVault> {
    return g[REX_VAULTS] as Map<string, SecretVault>;
}

export async function applyContext(config: SecretsPartialConfig, ctx: ExecutionContext) : Promise<void> {
    const registry = getRegistry();
    const vaults = getVaults();
    
    for (const vaultDef of config.vaults) {
        const url = new URL(vaultDef.uri);
        for(const loader of registry.values()) {
           if (loader.canHandle(url)) {
                const vault = loader.load(vaultDef);
                vaults.set(vaultDef.name, vault);
                break;
           }
        }
    }

    for (const secretDef of config.secrets) {
        const vault = vaults.get(secretDef.vault ?? "default");
        if (!vault) {
            throw new Error(`Vault ${secretDef.vault} not found`);
        }

        const name = secretDef.key ?? secretDef.name;
        let value : string | undefined = undefined;
        try {
            value = await vault.getSecretValue(name);
        } catch {
            // ignore
        }

        if (value === undefined || value === null) {
            if (!secretDef.gen) {
                throw new Error(`Secret ${name} not found in vault ${secretDef.vault ?? "default"}`);
            }
           
            const sg = new DefaultSecretGenerator();
            let { digits, upper, lower, special, size } = secretDef;
            size ??= 16;
            upper ??= true;
            lower ??= true;
            digits ??= true;
            special ??= "!@#+=^&*()_-[]{}";

            if (digits) {
                sg.add("0123456789");
            }

            if (upper) {
                sg.add("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
            }

            if (lower) {
                sg.add("abcdefghijklmnopqrstuvwxyz");
            }

            if (special) {
                sg.add(special);
            }

            value = sg.generate(size);
            await vault.setSecret(name, value);
        }

        ctx.secrets.set(secretDef.name, value);
    }
}