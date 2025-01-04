import { HostFileDriver } from "./hostfile.ts";
import type { DnsDriver, DnsDriverFactory, DnsDriverParams } from "./types.ts";

const g = globalThis as Record<string | symbol, unknown>;
export const REX_DNS_DRIVER_REGISTRY = Symbol.for("@@REX_DNS_DRIVER_REGISTRY");
export const REX_DNS_DRIVERS = Symbol.for("@@REX_DNS_DRIVERS");

if (!g[REX_DNS_DRIVERS]) {
    g[REX_DNS_DRIVERS] = new Map<string, DnsDriver>();
    const r = g[REX_DNS_DRIVERS] as Map<string, DnsDriver>;

    r.set("hostfile", new HostFileDriver({ name: "hostfile" }));
}

export function getDnsDrivers(): Map<string, DnsDriver> {
    return g[REX_DNS_DRIVERS] as Map<string, DnsDriver>;
}


export class DnsDriverRegistry extends Map<string, DnsDriverFactory> {

    
    async build(params: DnsDriverParams): Promise<DnsDriver> {
        let { use, uri, } = params;

        if (!use && !uri) {
            use = "hostfile";
        } else if (!use && uri) {
            const url = new URL(uri);
            const scheme = url.protocol.replace(":", "");
            let org = "rex";
            let moduleName = "dns-" + scheme;
            if (scheme.includes("--")) {
                const parts = scheme.split("--");
                org = parts[0];
                moduleName = parts[1];
            }

            use = `@${org}/${moduleName}`;
        }

        // use should be the import e.g @rex/vaults-sops-cli
        // import should be jsr:@rex/vaults-sops-cli/loader
        let factory: DnsDriverFactory | undefined = undefined;
        if (use === 'hostfile') {
            factory = this.get(use);
        } else {
            const directive = `jsr:${use}/loader`;
            if (!this.has(use!)) {
                const mod = await import(directive) as { factory: DnsDriverFactory };
                this.set(use!, mod.factory);
            }
            factory = this.get(use!);
        }

        if (!factory) {
            throw new Error(`Dns driver factory ${use} not found`);
        }

        return await factory.build(params);
    }

    async buildAndRegister(params: DnsDriverParams): Promise<DnsDriver> {
        const driver = await this.build(params);
        getDnsDrivers().set(params.name, driver);
        return driver;
    }

    async getOrCreate(params: DnsDriverParams): Promise<DnsDriver> {
        const name = params.name;
        const states = getDnsDrivers();
        if (states.has(name) && !params.replace) {
            return states.get(name) as DnsDriver;
        }

        const driver = await this.build(params);
        states.set(name, driver);

        return driver;
    }
}

if (!g[REX_DNS_DRIVER_REGISTRY]) {
    g[REX_DNS_DRIVER_REGISTRY] = new DnsDriverRegistry();
}

export function getDnsDriverRegistry(): DnsDriverRegistry {
    return g[REX_DNS_DRIVER_REGISTRY] as DnsDriverRegistry;
}