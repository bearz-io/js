export interface DnsRecord extends Record<string | symbol, unknown> {
    name: string;
    type: string;
    ttl?: number;
    value: string;
    priority?: number;
    origin?: string;
    proxy?: boolean;
}

export interface DnsDriverParams extends Record<string | symbol, unknown> {
    name: string;
    use?: string;
    uri?: string;
    with?: Record<string, unknown>;
    replace?: boolean;
}

export interface DnsDriver {
    readonly name: string;

    readonly driver: string;

    setRecord(zone: string, record: DnsRecord): Promise<void>;

    removeRecord(zone: string, name: string): Promise<void>;

    getRecord(zone: string, name: string): Promise<DnsRecord | undefined>;
}

export interface DnsDriverFactory {
    canBuild(driver: DnsDriverParams): boolean;
    build(params: DnsDriverParams): DnsDriver;
}
