import { factory, JsonStateStore } from "./json_state_store.ts";
import type { StateDriverFactory, StateDriverParams, StateStore } from "./types.ts";

const g = globalThis as Record<string | symbol, unknown>;
export const REX_STATES_REGISTRY = Symbol.for("@@REX_STATES_REGISTRY");
export const REX_STATES = Symbol.for("@@REX_STATES");

if (!g[REX_STATES]) {
    g[REX_STATES] = new Map<string, StateStore>();
    const r = g[REX_STATES] as Map<string, StateStore>;

    r.set("default", new JsonStateStore({ name: "default", global: false }));
    r.set("global", new JsonStateStore({ name: "global", global: true }));
}

export function getStates(): Map<string, StateStore> {
    return g[REX_STATES] as Map<string, StateStore>;
}

export class StatesRegistry extends Map<string, StateDriverFactory> {
    async build(params: StateDriverParams): Promise<StateStore> {
        let { use, uri } = params;

        if (!use && !uri) {
            use = "@rex/states-json";
        } else if (!use && uri) {
            const url = new URL(uri);
            const scheme = url.protocol.replace(":", "");
            let org = "rex";
            let moduleName = "states-" + scheme;
            if (scheme.includes("--")) {
                const parts = scheme.split("--");
                org = parts[0];
                moduleName = parts[1];
            }

            use = `@${org}/${moduleName}`;
        } else if (use) {
            if (!use.startsWith("@")) {
                use = `@rex/states-${use}`;
            }
        }

        // use should be the import e.g @rex/vaults-sops-cli
        // import should be jsr:@rex/vaults-sops-cli/loader
        let factory: StateDriverFactory | undefined = undefined;
        if (!this.has(use!)) {
            const directive = `jsr:${use}/factory`;
            const mod = await import(directive) as { factory: StateDriverFactory };
            this.set(use!, mod.factory);
        }

        factory = this.get(use!);
        if (!factory) {
            throw new Error(`State driver factory ${use} not found`);
        }

        const store = await factory.build(params);
        return store;
    }

    async buildAndRegister(params: StateDriverParams): Promise<StateStore> {
        const store = await this.build(params);
        getStates().set(params.name, store);
        return store;
    }

    async getOrCreate(params: StateDriverParams): Promise<StateStore> {
        const name = params.name;
        const states = getStates();
        if (states.has(name) && !params.update) {
            return states.get(name) as StateStore;
        }

        const store = await this.build(params);
        states.set(name, store);

        return store;
    }
}

if (!g[REX_STATES_REGISTRY]) {
    g[REX_STATES_REGISTRY] = new StatesRegistry();
    const r = g[REX_STATES_REGISTRY] as StatesRegistry;
    r.set("@rex/states-json", factory);
}

export function getStatesRegistry(): StatesRegistry {
    return g[REX_STATES_REGISTRY] as StatesRegistry;
}

export function getGlobalState(): StateStore {
    return getStates().get("global") as StateStore;
}

export function getDefaultState(): StateStore {
    return getStates().get("default") as StateStore;
}
