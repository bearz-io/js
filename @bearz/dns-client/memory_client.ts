import type { DnsClient, DnsOperationParams, DnsRecord, DnsRecordsClient } from "./types.ts";
import { abort, fail, ok, type Result, voided, type VoidResult } from "@bearz/functional";
import { NotFoundError } from "@bearz/errors/not-found";

/**
 * The memory DNS records client. Primarily used for testing.
 */
export class MemoryDnsRecordsClient implements DnsRecordsClient, Record<string | symbol, unknown> {
    #data = new Map<string, DnsRecord[]>();

    /**
     * Creates a new instance of the memory DNS records client.
     * @param name The name of the client.
     */
    constructor(public readonly name: string = "memory") {
    }

    /**
     * The name of the driver.
     */
    readonly driver = "memory";

    /**
     * The name of the client.
     */
    [key: symbol | string]: unknown;

    /**
     * Lists the DNS records for a given zone.
     * @param zone The zone to list records for.
     * @param params The parameters for the operation.
     * @returns A result that resolves to an array of dns records if the operation was successful,
     * otherwise, an error.
     */
    listRecords(zone: string, params?: DnsOperationParams): Promise<Result<DnsRecord[]>> {
        if (params?.signal?.aborted) {
            Promise.reject(abort(params.signal));
        }

        const res = this.#data.get(zone) ?? [];
        return Promise.resolve(ok(res));
    }

    /**
     * Lists the DNS record names for a given zone.
     * @param zone The zone to list records for.
     * @param params The parameters for the operation.
     * @returns A result that resolves to an array of dns record names if the operation was successful,
     * otherwise, an error.
     */
    listRecordNames(zone: string, params?: DnsOperationParams): Promise<Result<string[]>> {
        return this.listRecords(zone, params).then((res) => {
            return res.map((records) => records.map((record) => record.name));
        });
    }

    /**
     * 
     * @param zone The zone to get the record for.
     * @param name The name of the record to get.
     * @param params The parameters for the operation.
     * @returns A result that resolves to the dns record if the operation was successful,
     * otherwise, an error.
     */
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

    /**
     * Sets a DNS record for a zone.
     * @param zone The zone to set the record for.
     * @param record The record to set.
     * @param params The parameters for the operation.
     * @returns Returns a result that is Ok if the operation was successful, otherwise, an error.
     */
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

    /**
     * Deletes a DNS record for a zone.
     * 
     * @param zone The zone to delete the record for.
     * @param name The name of the record to delete.
     * @param params The parameters for the operation.
     * @returns A result that is Ok if the operation was successful, otherwise, an error.
     */
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
/**
 * The memory DNS client.
 */
export class MemoryDnsClient implements DnsClient, Record<string | symbol, unknown> {

    /**
     * The DNS records client for the client.
     */
    readonly records: DnsRecordsClient;

    /**
     * Creates a new instance of the memory DNS client.
     * @param name The name of the client.
     */
    constructor(public readonly name: string = "memory") {
        this.records = new MemoryDnsRecordsClient(name);
    }

    /**
     * The name of the driver.
     */
    get driver() {
        return "memory";
    }

    [key: symbol | string]: unknown;
    
}

