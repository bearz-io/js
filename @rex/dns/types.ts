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
    /**
     * The name of the dns driver. This is used to reference the dns driver in other tasks.
     */
    name: string;
    /**
     * The configuration uri for the dns driver. Configuration can be done with the `uri` or the
     * the `with` properties.  e.g.  `flarectl:?api-token=${CF_API_TOKEN}`
     * instructs the configuration to use the module `@rex/dns-flarectl` with the api-token pulled from the environment
     * variable `CF_API_TOKEN`.
     *
     * Third-party modules will need to have the org in the protocol where the org/scope is seperated with two hyphens:
     * `myorg--mymodule:?api-token=${MY_API_TOKEN}`
     */
    uri?: string;
    /**
     * The name of the dns driver.  Rex modules can use shorthand names for drivers.
     * For example, the `@rex/dns-flarectl` module is mapped the shorthand name `flarectl`.
     *
     * Other 3rd party modules can be used by specifying the full import path where jsr is assumed
     * to be the repository for the module.  For example, `@myorg/mymodule`.  The module must
     * have a ./factory sub-mobule that exports a factory instance.
     */
    use?: string;
    /**
     * The configuration for the dns driver where each key is a configuration parameter. You will
     * need to refer to the documentation for the specific vault driver to determine the
     * the available configuration parameters.
     */
    with?: Record<string, unknown>;
    /**
     * If the dns driver already exists, should it be replaced?
     */
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
