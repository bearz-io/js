import type { DnsRecordsClient, DnsRecordsClientFactory } from "@bearz/dns/types";
import { registerProviderFactory, type ProviderFactoryConfig } from "@bearz/di";
import { HostfileDnsRecordsClient, type HostfileDnsRecordsClientParams } from "./client.ts";


export class HostfileDnsRecordsClientFactory implements DnsRecordsClientFactory {
    match(params: ProviderFactoryConfig): boolean {
        if (params.kind !== "dns")
            return false;

        const imports : string[] = ["hostfile", "@bearz/dns-hostfile", "@bearz/dns-hostfile@latest"];
        return (imports.includes(params.use) || (params.import !== undefined && imports.includes(params.import)));
    }

    create(params: ProviderFactoryConfig): DnsRecordsClient {
        const config = params as HostfileDnsRecordsClientFactoryConfig


        const o : HostfileDnsRecordsClientParams = {
            name: config.name,
            hostfile: config.with?.hostfile as string | undefined,
            backupDir: config.with?.["backup-dir"] as string | undefined,
        }

        return new HostfileDnsRecordsClient(o);
    }
}

export interface HostfileDnsRecordsClientFactoryConfig extends ProviderFactoryConfig {
    /**
     * The provider to use.
     */
    use: 'hostfile' | '@bearz/dns-hostfile' | '@bearz/dns-hostfile@latest';
    with?: {
        /**
         * The path to the hostfile.
         */
        "hostfile": string | undefined;
        /**
         * The path to the backup directory.
         */
        "backup-dir": string | undefined;
        /**
         * The path to the factory file for the import url. 
         */
        'factory-path': string | undefined;
    } | Record<string, unknown>;
}

export const factory = new HostfileDnsRecordsClientFactory();

registerProviderFactory("@bearz/dns-hostfile", factory);
registerProviderFactory("dns://hostfile", factory);
registerProviderFactory("dns://bearz-hostfile", factory);