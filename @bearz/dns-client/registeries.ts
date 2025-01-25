import type { DnsClient } from "./types.ts";
import { MemoryDnsClientFactory } from "./memory_factory.ts";
import { coerceError, ok, type Result } from "@bearz/functional";
import {
    createDynamicProvider,
    createProvider,
    getServices,
    type ProviderFactoryConfigParams,
    registerProviderFactory,
    type ServicesContainer,
    toProviderFactoryConfig,
} from "@bearz/di";

const services = getServices();

const f = new MemoryDnsRecordsClientFactory();

registerProviderFactory("dns-client://memory", f);
registerProviderFactory("@bearz/dns-client@latest/memory", f);

/**
 * The DNS clients collection/registry.
 */
export class DnsClients extends Map<string, DnsClient> {

    /**
     * Gets or creates a DNS client by its name.
     * @param name The name of the client.
     * @param factory The factory function to create the client.
     * @param overwrite Overwrite the client if it already exists.
     * @returns The DNS client.
     */
    getOrCreate(
        name: string,
        factory: (services: ServicesContainer) => DnsClient,
        overwrite = false,
    ) : DnsClient {
        if (this.has(name) && !overwrite) {
            return this.get(name)!;
        }

        const client = factory(services);
        this.set(name, client);

        return client;
    }

    /**
     * Registers a DNS client.
     * @param name The name of the client.
     * @param instance The client instance.
     * @returns The DNS clients collection/registry.
     */
    register(name: string, instance: DnsClient) : this
    /**
     * Registers a DNS client using a factory function.
     * @param name The name of the client.
     * @param factory The factory function to create the client.
     * @returns The DNS clients collection/registry.
     */
    register(name: string, factory: (services: ServicesContainer) => DnsClient): this
    register() : this {
        if (typeof arguments[1] === "function") {
            this.set(arguments[0], arguments[1](services));
            return this;
        }

        const name = arguments[0];
        const client = arguments[1];
        this.set(name, client);
        return this;
    }

    /**
     * Finds a DNS client by its parameters.
     * @param params The parameters to find the client.
     * @returns The DNS client, or undefined if not found.
     */
    findByParams(params: ProviderFactoryConfigParams): DnsClient | undefined {
        try {
            params = toProviderFactoryConfig(params);

            return this.get(params.name);
        } catch (_) {
            return undefined;
        }
    }

    /**
     * Defines a DNS client by its parameters.
     * 
     * @description
     * This is primarily used for internal calls to define
     * a dns client using a contract primarily meant for json
     * or yaml based configuration.
     * @param params The parameters to define the client.
     * @param overwrite Recreate the client if it already exists.
     * @returns The DNS client, or an error if not found.
     */
    define(params: ProviderFactoryConfigParams, overwrite = false): Result<DnsClient> {
        try {
            params = toProviderFactoryConfig(params);

            if (this.has(params.name) && !overwrite) {
                return ok(this.get(params.name)!);
            }

            const res = createProvider<DnsClient>(params);
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
     * Defines a DNS client by its parameters and will dynamically load 
     * the module responsible for creating the client if it is not already loaded.
     * 
     * @description
     * This is primarily used for internal calls to define
     * a dns client using a contract primarily meant for json
     * or yaml based configuration.
     * @param params The parameters to define the client.
     * @param overwrite Overwrite the client if it already exists.
     * @returns The DNS client, or an error if not found.
     */
    async dynamicDefine(
        params: ProviderFactoryConfigParams,
        overwrite = false,
    ): Promise<Result<DnsClient>> {
        params = toProviderFactoryConfig(params);

        if (this.has(params.name) && !overwrite) {
            return ok(this.get(params.name)!);
        }

        const res = await createDynamicProvider<DnsClient>(params);
        if (res.isError) {
            return res;
        }

        this.set(params.name, res.unwrap());
        return res;
    }
}

/**
 * Gets the global DNS clients collection/registry.
 * @returns The DNS clients collection/registry.
 */
export function dnsClients(): DnsClients {
    const key = "DNS_CLIENTS";
    let clients = services.get<DnsClients>(key)!;
    if (!clients) {
        clients = new DnsClients();
        services.set(key, clients);
    }

    return clients;
}