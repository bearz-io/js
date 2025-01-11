import type { Result, VoidResult } from "@bearz/functional";

/**
 * Represents a dns record type.
 */
export type DnsRecordType =
    | "A"
    | "AAAA"
    | "CNAME"
    | "MX"
    | "NS"
    | "PTR"
    | "SOA"
    | "SRV"
    | "TXT"
    | string;

export interface DnsRecord extends Record<string | symbol, unknown> {
    /**
     * The name of the dns record.
     */
    name: string;
    /**
     * The type of dns record.
     */
    type: DnsRecordType;
    /**
     * The time-to-live of the dns record.
     */
    ttl?: number;

    /**
     * The value of the dns record.
     */
    value: string;

    /**
     * The priority of the dns record.
     */
    priority?: number;

    /**
     * Is the dns record proxied?
     */
    proxy?: boolean;
}

/**
 * Represents the result of a dns operation.
 */
export interface DnsOperationParams {
    /**
     * The signal to use for the operation.
     */
    signal?: AbortSignal;
}

/**
 * A dns client that that manages dns records for a zone.
 */
export interface DnsRecordsClient extends Record<string | symbol, unknown> {
    /**
     * The name of the dns client.
     */
    readonly name: string;

    /**
     * The driver name of the dns client.
     */
    readonly driver: string;

    /**
     * Lists the dns records for a zone.
     * @param zone The zone name or id to list the records for.
     * @param params The parameters for the operation.
     * @returns A result that resolves to an array of dns records if the operation was successful,
     * otherwise, an error.
     */
    listRecords(zone: string, params?: DnsOperationParams): Promise<Result<DnsRecord[]>>;

    /**
     * Lists the dns record names for a zone.
     * @param zone The zone name or id to list the record names for.
     * @param params The parameters for the operation.
     * @returns A result that resolves to an array of dns record names if the operation was successful,
     * otherwise, an error.
     */
    listRecordNames(zone: string, params?: DnsOperationParams): Promise<Result<string[]>>;

    /**
     * Gets a dns record for a zone.
     * @param zone The zone name or id to get the record for.
     * @param name The name of the record to get.
     * @param params The parameters for the operation.
     * @returns A result that resolves to the dns record if the operation was successful,
     * otherwise, an error.
     */
    getRecord(zone: string, name: string, params?: DnsOperationParams): Promise<Result<DnsRecord>>;

    /**
     * Sets a dns record for a zone.
     * @param zone The zone name or id to set the record for.
     * @param record The record to set.
     * @param params The parameters for the operation.
     * @returns A result that is Ok if the operation was successful, otherwise, an error.
     */
    setRecord(zone: string, record: DnsRecord, params?: DnsOperationParams): Promise<VoidResult>;

    /**
     * Deletes a dns record for a zone.
     * @param zone The zone name or id to delete the record for.
     * @param name The name of the record to delete.
     * @param params The parameters for the operation.
     * @returns A result that is Ok if the operation was successful, otherwise, an error.
     */
    deleteRecord(zone: string, name: string, params?: DnsOperationParams): Promise<VoidResult>;
}

export interface DnsRecordsClientFactoryParams {
    /**
     * The name of the zone.
     */
    name: string;

    /**
     * The uri of the zone.
     */
    uri?: string;

    /**
     * The use of the zone.
     */
    use?: string;

    /**
     * The parameters for the zone.
     */
    with?: Record<string, unknown>;
}

export interface DnsRecordsClientFactory {
    match(params: DnsRecordsClientFactoryParams): boolean;

    create(params: DnsRecordsClientFactoryParams): DnsRecordsClient;
}
