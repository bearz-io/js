import type { SecretParam, SecretVaultParams, SecretParams } from "./types.ts";
import {
getGlobalTasks,
    getTaskHandlerRegistry,
    type Task,
    TaskBuilder,
    type TaskContext,
    type TaskDef,
    type TaskMap,
    toError,
} from "@rex/tasks";
import { fail, ok, type Result } from "@bearz/functional";
import { type Inputs, Outputs } from "@rex/primitives";
import { getVaultsRegistry } from "./registry.ts";
import { getVaults } from "./registry.ts";
import { DefaultSecretGenerator } from "@bearz/secrets/generator";
import { env } from "@bearz/env";

export interface LoadSecretsTask extends Task {
    params?: SecretParams
}

export interface LoadSecretsTaskDef extends TaskDef {
    id?: string;
    with: SecretParams | ((ctx: TaskContext) => Inputs | Promise<Inputs>);
}

export class LoadSecretsTaskBuilder extends TaskBuilder {
    constructor(task: LoadSecretsTask, map?: TaskMap) {
        super(task, map);

        if (task.params) {
            this.with({ secrets: task.params });
        }
    }
}

export function registerSecrets(def: LoadSecretsTaskDef, map?: TaskMap): LoadSecretsTaskBuilder;
export function registerSecrets(
    params: SecretParams,
    map?: TaskMap,
): LoadSecretsTaskBuilder;
export function registerSecrets(
    params: SecretParams,
    needs: string[],
    map?: TaskMap,
): LoadSecretsTaskBuilder;
export function registerSecrets(
    id: string,
    params: SecretParams,
    map?: TaskMap,
): LoadSecretsTaskBuilder;
export function registerSecrets(
    id: string,
    params: SecretParams,
    needs: string[],
    map?: TaskMap,
): LoadSecretsTaskBuilder;

export function registerSecrets(): LoadSecretsTaskBuilder {
    if (arguments.length < 1) {
        throw new Error("Invalid arguments");
    }
    const uses = "@rex/register-secrets";
    const first = arguments[0];
    const second = arguments[1];
    const isArray = Array.isArray(first);
    if (typeof arguments[0] === "object" && !isArray) {
        const def = arguments[0] as LoadSecretsTaskDef;
        const task: LoadSecretsTask = {
            id: def.id ?? "secrets",
            uses,
            needs: def.needs ?? [],
            name: def.name ?? def.id,
            cwd: def.cwd,
            description: def.description,
            env: def.env,
            timeout: def.timeout,
            force: def.force,
            if: def.if,
        };

        if (def.with) {
            if (typeof def.with === "function") {
                task.with = def.with;
            } else {
                task.params = def.with;
            }
        }

        return new LoadSecretsTaskBuilder(task, arguments[1]);
    }

    if (isArray) {
        if (Array.isArray(second)) {
            return new LoadSecretsTaskBuilder({
                id: "secrets",
                uses,
                name: "secrets",
                needs: second as string[],
                params: first as SecretParams,
            }, arguments[2]);
        }

        return new LoadSecretsTaskBuilder({
            id: "secrets",
            uses,
            name: "secrets",
            needs: [],
            params: first as SecretParams,
        }, arguments[1]);
    }

    const id = first as string;
    const third = arguments[2];
    if (third && Array.isArray(third)) {
        return new LoadSecretsTaskBuilder({
            id,
            uses,
            name: id,
            needs: third as string[],
            inputs: second as SecretParams,
        }, arguments[3]);
    }

    return new LoadSecretsTaskBuilder({
        id,
        uses,
        name: id,
        needs: [],
        inputs: second as SecretParams,
    }, arguments[2]);
}



export interface RegisterSecretVaultTask extends Task {
    params?: SecretVaultParams
}

export interface RegisterSecretVaultTaskDef extends TaskDef {
    id?: string;
    with: SecretVaultParams | ((ctx: TaskContext) => Inputs | Promise<Inputs>);
}

export class RegisterSecretVaultTaskBuilder extends TaskBuilder {
    constructor(task: RegisterSecretVaultTask, map?: TaskMap) {
        super(task, map);

        if (task.params) {
            this.with(task.params);
        }
    }
}

export function registerSecretVault(task: RegisterSecretVaultTaskDef, map?: TaskMap): RegisterSecretVaultTaskBuilder;
export function registerSecretVault(
    inputs: SecretVaultParams,
    map?: TaskMap,
): RegisterSecretVaultTaskBuilder;
export function registerSecretVault(
    inputs: SecretVaultParams,
    needs: string[],
    map?: TaskMap,
): RegisterSecretVaultTaskBuilder;
export function registerSecretVault(
    id: string,
    inputs: SecretVaultParams,
    needs: string[],
    map?: TaskMap,
): RegisterSecretVaultTaskBuilder;
export function registerSecretVault(): RegisterSecretVaultTaskBuilder {
    if (arguments.length < 1) {
        throw new Error("Invalid arguments");
    }

    const uses = "@rex/register-secret-vault";
    const first = arguments[0];
    const second = arguments[1];

    if (typeof first === 'object') {
        if (first.with !== undefined && (typeof first.with === 'function' || first.with.name)) {
            const def = arguments[0] as RegisterSecretVaultTaskDef;
            const w = def.with;
            const isFunction = typeof w === "function";
            const map = arguments[1] as TaskMap ?? getGlobalTasks();
            const replace = !isFunction && w.replace;
            let id = "";
            if (def.id) {
                id = def.id;
                if (!replace && map.has(id)) {
                    throw new Error(`Task ${id} already exists`);
                }
            } else {
                id = "secret-vault";
                if (!isFunction) {
                    id = `secret-vault-${w.name}`;
                }
                const exists = map.has(id);
                if (exists && !replace) {
                    throw new Error(`Task ${id} already exists`);
                }
            }
    
            const task: RegisterSecretVaultTask = {
                id,
                uses, 
                needs: def.needs ?? [],
                name: def.name ?? id,
                cwd: def.cwd,
                description: def.description,
                env: def.env,
                timeout: def.timeout,
                force: def.force,
                if: def.if,
            };
    
            if (isFunction)
                task.with = w;
            else
                task.params = w;
    
            return new RegisterSecretVaultTaskBuilder(task, map);
        } else {
            const params = first as SecretVaultParams;
            let id = `secret-vault-${params.name}`;
            const map = arguments[1] as TaskMap ?? getGlobalTasks();
            if (map.has(id) && !params.replace) {
                throw new Error(`Task ${id} already exists`);
            }
        
            const old = id;
            let i = 0
            while(map.has(id)) {
                id = `${old}-${i++}`;
            }
            let needs: string[] = [];
            if (Array.isArray(second)) {
                needs = second as string[];
                return new RegisterSecretVaultTaskBuilder({
                    id,
                    uses,
                    name: id,
                    needs,
                    params,
                }, map);
            }
        
            return new RegisterSecretVaultTaskBuilder({
                id,
                uses,
                name: id,
                needs: [],
                params,
            }, map);
        }
    }
    

    const id = first as string;
    const params = second as SecretVaultParams;
    const third = arguments[2];
    if (Array.isArray(third)) {
        const needs = third as string[];
        return new RegisterSecretVaultTaskBuilder({
            id,
            uses,
            name: id,
            needs,
            params,
        }, arguments[3]);
    }

    return new RegisterSecretVaultTaskBuilder({
        id,
        uses, 
        name: id,
        needs: [],
        params,
    }, arguments[2]);
}

const taskRegistry = getTaskHandlerRegistry();

taskRegistry.set("@rex/register-secret-vault", {
    id: "@rex/register-secret-vault",
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
        try {
            const inputs = ctx.state.inputs;

            const g : (key: string) => string | undefined = (key) => {
                if (ctx.state.env.get(key))
                    return ctx.state.env.get(key);
                
                if (ctx.env.get(key))
                    return ctx.env.get(key);

                return env.get(key);
            }

            const w = inputs.get("with") as Record<string, unknown> | undefined;
            if (w) {
                for (const key in Object.keys(w)) {
                    let value = w[key];
                    if (typeof value === "string" && value.includes("$")) {
                        value = env.expand(value, {
                            get: g
                        })
                    }
                    
                    w[key] = value;
                }
            }

            let uri = inputs.get("uri") as string | undefined;
            if (uri) {
                if (uri.includes("$")) {
                    uri = env.expand(uri, {
                        get: g
                    });
                }
            }

            const params : SecretVaultParams = {
                name: inputs.get("name") as string ?? "default",
                uri,
                use: inputs.get("use") as string | undefined,
                with: w,
                replace: inputs.get("update") as boolean ?? false, 
            }

            const registry = getVaultsRegistry();
            if (registry.has(params.name) && !params.replace) {
                return fail(new Error(`Secret vault ${params.name} already exists`));
            }

            await registry.buildAndRegister(params);
            const o = new Outputs();
            o.set("name", params.name);
            o.set("use", params.use ?? "");
            o.set("uri", params.uri ?? "");

            return ok(o);
        } catch (e) {
            return fail(toError(e));
        }
    },
});

taskRegistry.set("@rex/register-secrets", {
    id: "@rex/register-secrets",
    inputs: [{
        name: "secrets",
        type: "array",
        description: "The secrets to load",
        required: true,
    }],
    outputs: [],
    run: async (ctx: TaskContext): Promise<Result<Outputs>> => {
        try {
            const inputs = ctx.state.inputs;

            const secrets = inputs.get("secrets") as SecretParam[] | undefined;
            if (!secrets) {
                throw new Error("No secrets provided");
            }
    
            const vaults = getVaults();
            for (const secretDef of secrets) {
                const vaultName = secretDef.vault ?? "default";
                const key = secretDef.key ?? secretDef.name;
                let value: string | undefined = undefined;
                const vault = vaults.get(vaultName);
                if (!vault) {
                    return fail(new Error(`Vault ${vaultName} not found`));
                }
    
                try {
                    value = await vault.getSecretValue(key);
                } catch (ex) {
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
                    } catch (ex) {
                        if (ex instanceof Error) {
                            return fail(ex);
                        } else {
                            return fail(new Error(`Unknown error ${ex}`));
                        }
                    }
                }
    
                ctx.secrets.set(secretDef.name, value);
            }
    
            return ok(new Outputs());
        } catch(e) {
            return fail(toError(e));
        }
    },
});
