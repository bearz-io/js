import type { SecretDef, SecretsVaultConfigLoader, VaultDef } from "./types.ts";
import { REX_TASKS_REGISTRY, type TaskContext, type Task, TaskBuilder, type TaskMap } from "@rex/tasks";
import { type Result, ok, fail } from "@bearz/functional";
import { Outputs } from "@rex/primitives";
import { getRegistry } from "./registry.ts";
import { getVaults } from "./registry.ts";
import { DefaultSecretGenerator } from "@bearz/secrets/generator";

export interface LoadSecretsInputs extends Record<string, unknown> {
    secrets: SecretDef[];
}

export interface LoadSecretsTask extends Task {
    inputs: LoadSecretsInputs;
}

export class LoadSecretsTaskBuilder extends TaskBuilder {

    constructor(task: LoadSecretsTask, map?: TaskMap) {
        super(task, map);

        if (task.inputs) {
            this.with(task.inputs);
        }
    }
}

export function secrets(task: LoadSecretsTask, map?: TaskMap): LoadSecretsTaskBuilder;
export function secrets(id: string, inputs: LoadSecretsInputs, map?: TaskMap): LoadSecretsTaskBuilder 
export function secrets(id: string, needs: string[], inputs: LoadSecretsInputs, map?: TaskMap): LoadSecretsTaskBuilder 
export function secrets(): LoadSecretsTaskBuilder {
    if (arguments.length < 1) {
        throw new Error("Invalid arguments");
    }
    
    if (typeof arguments[0] === "object") {
        const def = arguments[0] as LoadSecretsTask;
        def.uses = "@rex/load-secrets";
        if (!def.name) {
            def.name = def.id;
        }
        if (!def.needs) {
            def.needs = [];
        }

        return new LoadSecretsTaskBuilder(def, arguments[1]);
    }
    const id = arguments[0] as string;
    const second = arguments[1];
    if (Array.isArray(second)) {
        const needs = second as string[];
        const inputs = arguments[2] as LoadSecretsInputs;
        if (arguments.length === 4) {
            return new LoadSecretsTaskBuilder({
                id: id,
                uses: "@rex/load-secrets",
                name: id,
                needs: needs,
                inputs: inputs,
            }, arguments[3]);
        }

        return new LoadSecretsTaskBuilder({
            id: id,
            uses: "@rex/load-secrets",
            name: id,
            needs: needs,
            inputs: inputs,
        });
    }

    const inputs = second as LoadSecretsInputs;
    if (arguments.length === 3) {
        return new LoadSecretsTaskBuilder({
            id: id,
            uses: "@rex/load-secrets",
            name: id,
            needs: [],
            inputs: inputs,
        }, arguments[2]);
    }

    return new LoadSecretsTaskBuilder({
        id: id,
        uses: "@rex/load-secrets",
        name: id,
        needs: [],
        inputs: inputs,
    }); 
}

export interface LoadVaultInputs extends Record<string, unknown> {
    name: string;
    uri: string;
    use?: string;
    with?: Record<string, unknown>;
}

export interface LoadVaultTask extends Task {
    inputs: LoadVaultInputs;
}

export class LoadVaultTaskBuilder extends TaskBuilder {
    constructor(task: LoadVaultTask, map?: TaskMap) {
        super(task, map);

        if (task.inputs) {
            this.with(task.inputs);
        }
    }
}

export function secretVault(task: LoadVaultTask, map?: TaskMap): LoadVaultTaskBuilder;
export function secretVault(id: string, inputs: LoadVaultInputs, map?: TaskMap): LoadVaultTaskBuilder 
export function secretVault(id: string, needs: string[], inputs: LoadVaultInputs, map?: TaskMap): LoadVaultTaskBuilder 
export function secretVault(): LoadVaultTaskBuilder {
    if (arguments.length < 1) {
        throw new Error("Invalid arguments");
    }
    
    if (typeof arguments[0] === "object") {
        const def = arguments[0] as LoadVaultTask;
        def.uses = "@rex/load-vault";
        if (!def.name) {
            def.name = def.id;
        }
        if (!def.needs) {
            def.needs = [];
        }

        return new LoadVaultTaskBuilder(def, arguments[1]);
    }
    const id = arguments[0] as string;
    const second = arguments[1];
    if (Array.isArray(second)) {
        const needs = second as string[];
        const inputs = arguments[2] as LoadVaultInputs;
        if (arguments.length === 4) {
            return new LoadVaultTaskBuilder({
                id: id,
                uses: "@rex/load-vault",
                name: id,
                needs: needs,
                inputs: inputs,
            }, arguments[3]);
        }

        return new LoadVaultTaskBuilder({
            id: id,
            uses: "@rex/load-vault",
            name: id,
            needs: needs,
            inputs: inputs,
        });
    }

    const inputs = second as LoadVaultInputs;
    if (arguments.length === 3) {
        return new LoadVaultTaskBuilder({
            id: id,
            uses: "@rex/load-vault",
            name: id,
            needs: [],
            inputs: inputs,
        }, arguments[2]);
    }

    return new LoadVaultTaskBuilder({
        id: id,
        uses: "@rex/load-vault",
        name: id,
        needs: [],
        inputs: inputs,
    }); 
}

REX_TASKS_REGISTRY.set("@rex/load-vault", {
    id: "secret-vault",
    inputs: [{
        name: "name",
        type: "string",
        description: "The name of the secret vault to create",
    }, {
        name: "uri",
        type: "string",
        description: "The URI of the secret vault",
        required: true,
    }, {
        name: "use",
        type: "string",
        description: "The use of the secret vault",
        required: false,
    }, {
        name: "with",
        type: "object",
        description: "Additional configuration for the secret vault",
        required: false,
    }],
    outputs: [],
    run: async (ctx: TaskContext): Promise<Result<Outputs>> => {
        const inputs = ctx.state.inputs

        const name = inputs.get("name") as string ?? "default";
        const uri = inputs.get("uri") as string;
        let use = inputs.get("use") as string;

        /*
tasks:
   - use: @rex/load-vault
     with:
        name: "sops"
        uri: "sops://"
        use: "@rex/vaults-sops-cli"
        with:
            age:
                recipients: "..."
                keyFile: "..."
                key: "..."
            config: "..."
            vaultUri: "..."
            gcpKmsUri: "..."
            kmsArns: "..."
            pgpFingerprints: "..."
            azureKvUri: "..."
        */

        const registry = getRegistry();
        
        // use should be the import e.g @rex/vaults-sops-cli
        // import should be jsr:@rex/vaults-sops-cli/loader
        let loader : SecretsVaultConfigLoader | undefined = undefined;
        if (use) {
            const directive = `jsr:${use}/loader`;
            if (!registry.has(use)) {
                const mod = await import(directive) as { loader: SecretsVaultConfigLoader };
                registry.set(use, mod.loader);
            }
            loader = registry.get(use);
        } else {
            const url = new URL(uri);
            const scheme = url.protocol.replace(":", "");
            let org = "rex";
            let moduleName = "vaults-" + scheme;
            if (scheme.includes("--")) {
                const parts = scheme.split("--");
                org = parts[0];
                moduleName = parts[1]
            }

            use = `@${org}/${moduleName}`;
            const importDirective = `jsr:${use}/loader`;
            if (!registry.has(importDirective)) {
                const mod = await import(importDirective) as { loader: SecretsVaultConfigLoader };
                registry.set(use, mod.loader);
            }

            loader = registry.get(use);
        }

        if (!loader) {
            throw new Error(`Secrets vault loader ${use} not found`);
        }

        const vaultDef : VaultDef = {
            name: name,
            uri: uri,
            use: use,
            with: inputs.get("with") as Record<string, unknown>,
        }

        const vault = loader.load(vaultDef);
        const vaults = getVaults();
        if (vaults.has(name)) {
            throw new Error(`Vault ${name} already exists`);
        }

        vaults.set(name, vault);
        return ok(new Outputs());
    },
});



REX_TASKS_REGISTRY.set("@rex/load-secrets", {
    id: "secret-vault",
    inputs: [{
        name: "secrets",
        type: "array",
        description: "The secrets to load",
        required: true,
    }],
    outputs: [],
    run: async (ctx: TaskContext): Promise<Result<Outputs>> => {
        const inputs = ctx.state.inputs

        const secrets = inputs.get("secrets") as SecretDef[] | undefined;
        if (!secrets) {
            throw new Error("No secrets provided");
        }

        const vaults = getVaults();
        for (const secretDef of secrets) {
            const vaultName = secretDef.vault ?? "default";
            const key = secretDef.key ?? secretDef.name;
            let value : string | undefined = undefined;
            const vault = vaults.get(vaultName);
            if (!vault) {
               return fail(new Error(`Vault ${vaultName} not found`));
            }

            try {
                value = await vault.getSecretValue(key);
            } catch(ex) {
                if (ex instanceof Error) {
                    return fail(ex);
                } else {
                    return fail(new Error(`Unknown error ${ex}`));
                }
            }

            if (value === undefined || value === null) {
                if (!secretDef.gen) {
                    return fail(new Error(`Secret ${key} not found in vault ${vaultName}`));
                }

                const sg = new DefaultSecretGenerator();
                if (secretDef.lower === undefined || secretDef.lower) {
                    sg.add("abcdefghijklmnopqrstuvwxyz");
                }

                if (secretDef.upper === undefined || secretDef.upper) {
                    sg.add("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
                }

                if (secretDef.digits === undefined || secretDef.digits) {
                    sg.add("0123456789");
                }
                
                if (secretDef.special) {
                    sg.add(secretDef.special);
                }

                if (secretDef.size === undefined) {
                    secretDef.size = 16;
                }

                try {
                    value = sg.generate(secretDef.size);
                    await vault.setSecret(key, value);
                } catch(ex) {
                    if (ex instanceof Error) {
                        return fail(ex);
                    } else {
                        return fail(new Error(`Unknown error ${ex}`));
                    }   
                }
            }

            ctx.secrets.set(secretDef.name, value);
        }

        /*
tasks:
   - use: @rex/load-vault
     with:
        name: "sops"
        uri: "sops://"
        use: "jsr:@rex/vaults-sops-cli"
        with:
            age:
                recipients: "..."
                keyFile: "..."
                key: "..."
            config: "..."
            vaultUri: "..."
            gcpKmsUri: "..."
            kmsArns: "..."
            pgpFingerprints: "..."
            azureKvUri: "..."
        */

        

        return ok(new Outputs());
    },
});
