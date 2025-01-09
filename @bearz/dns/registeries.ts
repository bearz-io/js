import type { DnsRecordsClient } from "./types.ts";
import { MemoryDnsRecordsClientFactory } from "./memory_client.ts";
import { type Result, ok, coerceError } from "@bearz/functional";
import { createProvider, createDynamicProvider, toProviderFactoryConfig, getServices, registerProviderFactory, type ProviderFactoryConfigParams } from "@bearz/di";

const services = getServices();

const f = new MemoryDnsRecordsClientFactory()

registerProviderFactory("dns://memory", f);
registerProviderFactory("@bearz/dns@latest/memory", f);

export class DnsRecordClients extends Map<string, DnsRecordsClient> {

    findByParams(params: ProviderFactoryConfigParams): DnsRecordsClient | undefined {
        try {
            params = toProviderFactoryConfig(params);

            return this.get(params.name);
        } catch (_) {
            return undefined;
        }
    }

    define(params: ProviderFactoryConfigParams, overwrite = false): Result<DnsRecordsClient> {
        try {
            params = toProviderFactoryConfig(params);

            if (this.has(params.name) && !overwrite)
                return ok(this.get(params.name)!);
    
            const res = createProvider<DnsRecordsClient>(params)
            if (res.isError)
                return res;
    
            this.set(params.name, res.unwrap());
            return res;

        } catch (e) {
            return coerceError(e);
        }
    }

    async dynamicDefine(params: ProviderFactoryConfigParams, overwrite = false): Promise<Result<DnsRecordsClient>> {
        params = toProviderFactoryConfig(params);

        if (this.has(params.name) && !overwrite)
            return ok(this.get(params.name)!);

        const res = await createDynamicProvider<DnsRecordsClient>(params);
        if (res.isError)
            return res;

        this.set(params.name, res.unwrap());
        return res;
    }
}

export function dnsRecordClients() : DnsRecordClients {
    const key = "DNS_RECORDS_CLIENTS";
    let clients = services.get<DnsRecordClients>(key)!;
    if (!clients) {
        clients = new DnsRecordClients();   
        services.set(key, clients);
    }

    return clients;
}

dnsRecordClients().define("dns://memory");