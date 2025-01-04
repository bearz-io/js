import { FileStateDriver, factory } from "./file_state_driver.ts";
import type { StateStore, StateDriverFactory, StateDriverParams } from "./types.ts";

const g = globalThis as Record<string | symbol, unknown>;
export const REX_STATES_REGISTRY = Symbol.for("@@REX_STATES_REGISTRY");
export const REX_STATES = Symbol.for("@@REX_STATES");

if (!g[REX_STATES]) {
    g[REX_STATES] = new Map<string, StateStore>();
    const r = g[REX_STATES] as Map<string, StateStore>;

    r.set("default", new FileStateDriver({ name: "default", global: false }));
    r.set("global", new FileStateDriver({ name: "global", global: true }));
}

export function getStates(): Map<string, StateStore> {
    return g[REX_STATES] as Map<string, StateStore>;
}


export class StatesRegistry extends Map<string, StateDriverFactory> {


    async build(params: StateDriverParams): Promise<StateStore> {
        let { use, uri, } = params;

        if (!use && !uri) {
            use = "file";
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
        }

        // use should be the import e.g @rex/vaults-sops-cli
        // import should be jsr:@rex/vaults-sops-cli/loader
        let loader: StateDriverFactory | undefined = undefined;
        if (use === 'file') {
            loader = this.get(use);
        } else if (use) {
            const directive = `jsr:${use}/loader`;
            if (!this.has(use)) {
                const mod = await import(directive) as { loader: StateDriverFactory };
                this.set(use, mod.loader);
            }
            loader = this.get(use);
        }

        if (!loader) {
            throw new Error(`State driver loader ${use} not found`);
        }

        const driver = await loader.build(params);
        return driver;
    }

    async buildAndRegister(params: StateDriverParams): Promise<StateStore> {
        const driver = await this.build(params);
        getStates().set(params.name, driver);
        return driver;
    }

    async getOrCreate(params: StateDriverParams): Promise<StateStore> {
        const name = params.name;
        const states = getStates();
        if (states.has(name) && !params.update) {
            return states.get(name) as StateStore;
        }

        const driver = await this.build(params);
        states.set(name, driver);

        return driver;
    }
}

if (!g[REX_STATES_REGISTRY]) {
    g[REX_STATES_REGISTRY] = new StatesRegistry();
    const r = g[REX_STATES_REGISTRY] as StatesRegistry;
    r.set("file", factory)
}


export function getStatesRegistry(): StatesRegistry {
    return g[REX_STATES_REGISTRY] as StatesRegistry
}

export function getGlobalState(): StateStore {
    return getStates().get("global") as StateStore;
}

export function getDefaultState(): StateStore {
    return getStates().get("default") as StateStore;
}

