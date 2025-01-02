export interface DnsRecord {
    name: string;
    type: string;
    ttl?: number;
    value: string;
    priority?: number;
    origin?: string;
}

export interface DnsDriverConfig extends Record<string | symbol, unknown> {
    name: string;

    use: string;
    with?: Record<string, unknown>;
}

export interface DnsDriver {
    readonly name: string;

    readonly driver: string;

    setRecord(zone: string, record: DnsRecord): Promise<void>;

    removeRecord(zone: string, name: string): Promise<void>;

    getRecord(zone: string, name: string): Promise<DnsRecord | undefined>;
}

export interface DnsDriverLoader {
    canHandle(driver: string): boolean;
    load(config: DnsDriverConfig): DnsDriver;
}
