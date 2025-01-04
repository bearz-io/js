import type { DnsDriver, DnsDriverParams, DnsDriverFactory, DnsRecord } from "./types.ts";
import { readTextFile, writeTextFile } from "@bearz/fs";
import { EOL, WINDOWS } from "@bearz/runtime-info";
import { processElevated } from "@bearz/process-elevated";

export class HostFileDriver implements DnsDriver {
    #name: string;

    constructor(config: DnsDriverParams) {
        this.#name = config.name;
    }

    get name(): string {
        return this.#name;
    }

    readonly driver = "hostfile";

    async setRecord(zone: string, record: DnsRecord): Promise<void> {
        const cname = record.name + "." + zone;

        if (!processElevated()) {
            throw new Error(
                "Hostfile driver requires elevated permissions to modify the hosts file",
            );
        }

        if (record.type !== "A") {
            throw new Error("Hostfile driver only supports A records");
        }

        // TODO: handle when windows is not installed on C:
        const hostFile = WINDOWS ? "C:\\Windows\\System32\\drivers\\etc\\hosts" : "/etc/hosts";
        const hosts = await readTextFile(hostFile);
        const lines = hosts.split(/\r?\n/);
        const result = [];
        let found = false;
        for (const line of lines) {
            if (found) {
                result.push(line);
                continue;
            }

            // uncomment line
            if (line.startsWith("#")) {
                if (!line.includes(cname)) {
                    result.push(line);
                    continue;
                }

                result.push(`${record.value} ${cname}`);
                found = true;
            }

            if (line.includes(cname)) {
                result.push(`${record.value} ${cname}`);
                found = true;
            }
        }

        if (!found) {
            result.push(`${record.value} ${cname}`);
        }

        await writeTextFile(hostFile, result.join(EOL));
    }

    async removeRecord(zone: string, name: string): Promise<void> {
        const cname = name + "." + zone;

        if (!processElevated()) {
            throw new Error(
                "Hostfile driver requires elevated permissions to modify the hosts file",
            );
        }

        const hostFile = WINDOWS ? "C:\\Windows\\System32\\drivers\\etc\\hosts" : "/etc/hosts";
        const hosts = await readTextFile(hostFile);
        const lines = hosts.split(/\r?\n/);
        const result = [];
        for (const line of lines) {
            if (line.startsWith("#")) {
                continue;
            }

            if (line.includes(cname)) {
                result.push("#" + line);
                continue;
            }

            result.push(line);
        }

        await writeTextFile(hostFile, result.join(EOL));
    }

    async getRecord(zone: string, name: string): Promise<DnsRecord | undefined> {
        const cname = name + "." + zone;

        const hostFile = WINDOWS ? "C:\\Windows\\System32\\drivers\\etc\\hosts" : "/etc/hosts";
        const hosts = await readTextFile(hostFile);
        const lines = hosts.split(/\r?\n/);
        for (const line of lines) {
            if (line.startsWith("#")) {
                continue;
            }

            if (line.includes(cname)) {
                const parts = line.split(/\s+/);
                return {
                    name: name,
                    type: "A",
                    value: parts[0],
                };
            }
        }
    }
}

export class HostFileDriverLoader implements DnsDriverFactory {
    canHandle(driver: string): boolean {
        return driver === "hostfile";
    }

    load(config: DnsDriverParams): DnsDriver {
        if (config.use !== "hostfile") {
            throw new Error(`Invalid use ${config.use} for hostfile driver`);
        }

        return new HostFileDriver(config);
    }
}

export const loader = new HostFileDriverLoader();
