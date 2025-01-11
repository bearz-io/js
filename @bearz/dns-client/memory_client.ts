import type { DnsOperationParams, DnsRecord, DnsRecordsClient } from "./types.ts";
import type { ProviderFactory, ProviderFactoryConfig } from "@bearz/di";
import { abort, fail, ok, type Result, voided, type VoidResult } from "@bearz/functional";
import { NotFoundError } from "@bearz/errors/not-found";

export class MemoryDnsRecordsClient implements DnsRecordsClient, Record<string | symbol, unknown> {
    #data = new Map<string, DnsRecord[]>();

    constructor(public readonly name: string = "memory") {
    }

    readonly driver = "memory";

    [key: symbol | string]: unknown;

    listRecords(zone: string, params?: DnsOperationParams): Promise<Result<DnsRecord[]>> {
        if (params?.signal?.aborted) {
            Promise.reject(abort(params.signal));
        }

        const res = this.#data.get(zone) ?? [];
        return Promise.resolve(ok(res));
    }

    listRecordNames(zone: string, params?: DnsOperationParams): Promise<Result<string[]>> {
        return this.listRecords(zone, params).then((res) => {
            return res.map((records) => records.map((record) => record.name));
        });
    }

    getRecord(zone: string, name: string, params?: DnsOperationParams): Promise<Result<DnsRecord>> {
        if (params?.signal?.aborted) {
            Promise.reject(abort(params.signal));
        }

        const records = this.#data.get(zone);
        if (!records) {
            return Promise.reject(fail(new NotFoundError(name)));
        }

        const record = records.find((record) => record.name === name);
        if (!record) {
            return Promise.reject(fail(new NotFoundError(name)));
        }

        return Promise.resolve(ok(record));
    }

    setRecord(zone: string, record: DnsRecord, params?: DnsOperationParams): Promise<VoidResult> {
        if (params?.signal?.aborted) {
            Promise.reject(abort(params.signal));
        }

        let records = this.#data.get(zone);
        if (!records) {
            records = [];
            this.#data.set(zone, records);
        }

        const index = records.findIndex((r) => r.name === record.name);
        if (index === -1) {
            records.push(record);
            return Promise.resolve(voided());
        }

        records[index] = {
            ...records[index],
            ...record,
        };
        return Promise.resolve(voided());
    }

    deleteRecord(zone: string, name: string, params?: DnsOperationParams): Promise<VoidResult> {
        if (params?.signal?.aborted) {
            Promise.reject(abort(params.signal));
        }

        const records = this.#data.get(zone);
        if (!records) {
            return Promise.resolve(voided());
        }

        const index = records.findIndex((record) => record.name === name);

        if (index === -1) {
            return Promise.resolve(voided());
        }

        records.splice(index, 1);

        this.#data.set(zone, records);
        return Promise.resolve(voided());
    }
}

export interface MemoryDnsRecordsClientConfig extends ProviderFactoryConfig {
    use: "memory" | "@bearz/dns-client/memory" | "@bearz/dns-client@latest/memory";
}

export class MemoryDnsRecordsClientFactory implements ProviderFactory {
    match(params: ProviderFactoryConfig): boolean {
        const imports = [
            "@bearz/dns-client@latest/memory",
            "@bearz/dns-client/memory",
            "bearz/dns-client/memory",
            "memory",
        ];
        if (
            params.kind === "dns" &&
            ((imports.includes(params.use)) || (params.import && (imports.includes(params.import))))
        ) {
            return true;
        }

        return false;
    }

    create(params: ProviderFactoryConfig): unknown {
        return new MemoryDnsRecordsClient(params.name);
    }
}
