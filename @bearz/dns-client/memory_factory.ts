import type { ProviderFactory, ProviderFactoryConfig } from "@bearz/di";
import { MemoryDnsClient } from "./memory_client.ts";

/**
 * The configuration for the memory DNS records client.
 */
export interface MemoryDnsClientConfig extends ProviderFactoryConfig {
    /**
     * The provider to use.
     */
    use: "memory" | "@bearz/dns-client/memory" | "@bearz/dns-client@latest/memory";
}

/**
 * The factory for the memory DNS records client.
 */
export class MemoryDnsClientFactory implements ProviderFactory {
    /**
     * Determines if the factory can create a client.
     * @param params The parameters for the factory.
     * @returns `true` if the factory can create a client, otherwise `false`.
     */
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

    /**
     * Creates a new memory DNS records client.
     * @param params The parameters for the factory.
     * @returns The created client.
     */
    create(params: ProviderFactoryConfig): MemoryDnsClient  {
        return new MemoryDnsClient(params.name);
    }
}