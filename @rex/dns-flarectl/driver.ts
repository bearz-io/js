import type { DnsDriver, DnsRecord } from "@rex/dns/types";
import { cmd } from "@bearz/exec";

export interface FlareCtlDnsProviderParams {
    name: string
    apiToken: string
}

export interface CloudFlareRecord {
    ID: string;
    Content: string;
    Name: string;
    Proxied: boolean;
    TTL: number;
    Type: string;
    Priority?: number;
}

export class FlareCtlDnsDriver implements DnsDriver {
    #params: FlareCtlDnsProviderParams;

    constructor(params: FlareCtlDnsProviderParams) {
        this.#params = params;
        if (this.#params.apiToken === "") {
            throw new Error("FlareCtlDnsDriver: missing api-token");
        }
    }

    get name(): string {
        return this.#params.name;
    }

    get driver(): string {
        return "flarectl";
    }

    async setRecord(zone: string, record: DnsRecord): Promise<void> {
        const vars : Record<string, string> = { "CF_API_TOKEN": this.#params.apiToken };

        if (zone === null || zone === undefined || zone === "") {
            throw new Error("zone is required");
        }

        if (record.type === null || record.type === undefined || record.type === "") {
            throw new Error("type is required");
        }

        if (record.name === null || record.name === undefined || record.name === "") {
            throw new Error("name is required");
        }

        if (record.value === null || record.value === undefined || record.value === "") {
            throw new Error("value is required");
        }

        if (record.name.endsWith(zone)) {
            record.name = record.name.replace(`.${zone}`, "");
        }

        const args = ["dns", "o", "--zone", zone, "--name", record.name, "--type", record.type, "--content", record.value ];
        if (record.ttl) {
            args.push("--ttl", record.ttl.toString());
        }

        if (record.priority) {
            args.push("--priority", record.priority.toString());
        }

        if (record.proxy) {
            args.push("--proxy");
        }

        const output = await cmd("flarectl", args, {
            env: vars,
        }).run();
        
        if (output.code !== 0) {
            throw new Error(`Failed to set record. code ${output.code}, stderr: ${output.errorText()}`);
        }
    }
   
    async removeRecord(zone: string, name: string): Promise<void> {
        if (zone === null || zone === undefined || zone === "") {
            throw new Error("zone is required");
        }

        if (name === null || name === undefined || name === "") {
            throw new Error("name is required");
        }

        const vars : Record<string, string> = {  "CF_API_TOKEN": this.#params.apiToken };
        if (!name.endsWith(zone)) {
            name = `${name}.${zone}`;
        }

        const args = ["--json", "dns", "l", "--zone", zone, "--name", name];
        const output = await cmd("flarectl", args, {
            env: vars,
        }).output();

        if (output.code !== 0) {
            throw new Error(`Failed to list records. code ${output.code}, stderr: ${output.errorText()}`);
        }

        const json = output.json() as Array<{ ID: string }>;
        if (json[0].ID) {
            const args = ["dns", "d", "--zone", zone, "--id", json[0].ID];
            const output = await cmd("flarectl", args, {
                env: vars,
            }).run();
            
            if (output.code !== 0) {
                throw new Error(`Failed to remove record. code ${output.code}, stderr: ${output.errorText()}`);
            }
        }
    }
   
    async getRecord(zone: string, name: string): Promise<DnsRecord | undefined> {
        if (zone === null || zone === undefined || zone === "") {
            throw new Error("zone is required");
        }

        if (name === null || name === undefined || name === "") {
            throw new Error("name is required");
        }
       
        const vars : Record<string, string> = { "CF_API_TOKEN": this.#params.apiToken };
        if (!name.endsWith(zone)) {
            name = `${name}.${zone}`;
        }

        const args = ["--json", "dns", "l", "--zone", zone, "--name", name];
        const output = await cmd("flarectl", args, {
            env: vars,
        }).output();

        if (output.code !== 0) {
            throw new Error(`Failed to list records. code ${output.code}, stderr: ${output.errorText()}`);
        }

        const json = output.json() as Array<CloudFlareRecord>;
        if (json.length > 0) {
            return {
                name: json[0].Name,
                type: json[0].Type,
                ttl: json[0].TTL,
                value: json[0].Content,
                priority: json[0].Priority,
                proxy: json[0].Proxied,
            };
        }

        return undefined;
    }
}