import type { DnsDriver, DnsDriverFactory, DnsDriverParams } from "@rex/dns/types";
import { FlareCtlDnsDriver } from "./driver.ts";
export type { FlareCtlDnsProviderParams } from "./driver.ts";

export class FlareCtlDnsDriverFactory implements DnsDriverFactory {
    canBuild(params: DnsDriverParams): boolean {
        return (params.uri !== undefined && params.uri.startsWith("flarectl:")) ||
            (params.use !== undefined && params.use === "flarectl" ||
                params.use === "@rex/dns-flarectl");
    }

    build(params: DnsDriverParams): DnsDriver {
        let token = "";
        const name = params.name;

        /*
            dns:
              name: "cloudflare"
              use: "flarectl"
              with:
                api-token: "xxxx"

            dns:
              name: "cloudflare"
              uri: "flarectl:?api-token=xxxx"
        */

        if (params.uri) {
            const url = new URL(params.uri);
            const t = url.searchParams.get("api-token") as string;
            if (t) {
                token = t;
            }
        }

        const w = params.with;
        if (w) {
            if (w["api-token"]) {
                token = w["api-token"] as string;
            }
        }

        if (token === "") {
            throw new Error("FlareCtlDnsDriverFactory: missing api-token");
        }

        return new FlareCtlDnsDriver({
            name,
            apiToken: token,
        });
    }
}

export const factory: FlareCtlDnsDriverFactory = new FlareCtlDnsDriverFactory();
