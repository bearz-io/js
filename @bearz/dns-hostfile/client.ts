import type { DnsOperationParams, DnsRecord, DnsRecordsClient } from "@bearz/dns/types";
import { abort, coerceError, fail, ok, voided, type Result, type VoidResult } from "@bearz/functional";
import { readTextFile, writeTextFile } from "@bearz/fs";
import { EOL, WINDOWS } from "@bearz/runtime-info";
import { processElevated } from "@bearz/process-elevated";
import { NotFoundError } from "../errors/not_found_error.ts";

export interface HostfileDnsRecordsClientParams extends Record<string, unknown> {
    name: string;

    backupDir?: string;

    hostfile?: string;
}

export class HostfileDnsRecordsClient implements DnsRecordsClient, Record<string | symbol, unknown> {
    #backupDir?: string;

    #hostfile: string

    #oshostfile: string;

    [key: symbol | string]: unknown

    constructor(params: HostfileDnsRecordsClientParams) {
        this.name = params.name;
        this.#backupDir = params?.backupDir;

        let hf = params.hostfile;
        let oshf = "";
        if (WINDOWS) {
            oshf = "C:\\Windows\\System32\\drivers\\etc\\hosts";
        } else {
            oshf = "/etc/hosts";
        }

        this.#oshostfile = oshf;
        if (!hf) {
            hf = oshf;
        }

        this.#hostfile = hf;
    }

    name: string;

    readonly driver: string = "hostfile";


    async list(zone: string, params?: DnsOperationParams): Promise<Result<DnsRecord[]>> {
        try {
            if (params?.signal?.aborted)
                return abort(params.signal);

            const content = await readTextFile(this.#hostfile);
            const lines = content.split(/\r?\n/);
            const results : DnsRecord[] = []
            for (const line of lines) {
                if (line.startsWith("#"))
                    continue;
    
                const names = line.trim().split(/\s+/).filter(p => p.length > 0);
                if (names.length < 2)
                    continue;
    
                const ip = names.shift()!;
                
                const matches = names.filter(n => n === zone || n.endsWith("." + zone));
                if (matches.length === 0)
                    continue;
    
                for (const name of matches) {
                    if (name === zone)
                    {
                        results.push({
                            name: "@",
                            type: "A",
                            value: ip,
                        });
                    } else {
                        results.push({
                            name: name.slice(0, name.length - zone.length - 1),
                            type: "A",
                            value: ip,
                        });
                    }
                }
            }
    
            return ok(results);
        } catch (error) {
            return coerceError(error);   
        }
    }

    listNames(zone: string, params?: DnsOperationParams): Promise<Result<string[]>> {
        return this.list(zone, params).then(res => {
            return res.map(records =>  {
                const matches = records.filter(r => r.name !== zone && r.name.endsWith("." + zone));

                return matches.map(r => r.name.slice(0, r.name.length - zone.length - 1));
            });
        });
    }

    async get(zone: string, name: string, params?: DnsOperationParams): Promise<Result<DnsRecord>> {
        try {
            if (params?.signal?.aborted)
                return abort(params.signal);

            const content = await readTextFile(this.#hostfile);
            const lines = content.split(/\r?\n/);
            let lineNum = 0;
            for (const line of lines) {
                lineNum++;
                if (line.startsWith("#"))
                    continue;
    
                const names = line.trim().split(/\s+/).filter(p => p.length > 0);
                if (names.length < 2)
                    continue;

                const test = name === "@" || name === "" ? zone : `${name}.${zone}`;
    
                const ip = names.shift()!;
                const match = names.find(n => n === test)
                if (match) {
                    return ok({
                        name: name,
                        type: "A",
                        value: ip,
                        line: lineNum
                    });
                }
            }

            return fail(new NotFoundError(`${name}.${zone}`));
        } catch(error) {
            return coerceError(error);
        }
    }


    async set(zone: string, record: DnsRecord, params?: DnsOperationParams): Promise<VoidResult> {
        try {
            if (params?.signal?.aborted)
                return abort(params.signal);

            if (record.name.trim().length === 0)
                return fail(new Error("Record name cannot be empty"));

            if (record.value.trim().length === 0)
                return fail(new Error("Record value cannot be empty"));

            if (record.type !== "A")
                return fail(new Error("Hostfile driver only supports A records"));

            if (this.#hostfile === this.#oshostfile && !processElevated())
                return fail(new Error("Hostfile driver requires elevated permissions to modify the hosts file at " + this.#hostfile));

            const results : string[] = [];
            const content = await readTextFile(this.#hostfile);
            const lines = content.split(/\r?\n/);
            const name = record.name;
            let found = false;
            const test = name === "@" || name === "" ? zone : `${name}.${zone}`;
            for (const line of lines) {
                if (line.startsWith("#")) {
                    results.push(line);
                    continue;
                }
                
                const names = line.trim().split(/\s+/).filter(p => p.length > 0);
                if (names.length < 2) {
                    results.push(line);
                    continue;
                }
    
                const ip = names.shift()!;
                const index = names.findIndex(n => n === test)
                if (index > -1) {
                    if(record.value === ip) {
                        // no changes required
                        return voided();
                    }

                    found = true;

                    // multiple records on the same line
                    if (names.length > 1) {
                        // remove the old record as the ip is changing
                        names.splice(index, 1);
                        results.push(`${ip} ${names.join(" ")}`);
                        // place the new record on a new line
                        results.push(`${record.value} ${test}`);
                    } else {
                        results.push(`${record.value} ${test}`);
                    }
                }
            }

            if (!found) {
                results.push(`${record.value} ${test}`);
            }

            await writeTextFile(this.#hostfile, results.join(EOL));
            return voided();
        } catch(error) {
            return coerceError(error);
        }
    }

    async delete(zone: string, name: string, params?: DnsOperationParams): Promise<VoidResult> {
        try {
            if (params?.signal?.aborted)
                return abort(params.signal);

            if (this.#hostfile === this.#oshostfile && !processElevated())
                return fail(new Error("Hostfile driver requires elevated permissions to modify the hosts file at " + this.#hostfile));

            const results : string[] = [];
            const content = await readTextFile(this.#hostfile);
            const lines = content.split(/\r?\n/);
            let found = false;
            const test = name === "@" || name === "" ? zone : `${name}.${zone}`;
            for (const line of lines) {
                if (line.startsWith("#")) {
                    results.push(line);
                    continue;
                }
                
                const names = line.trim().split(/\s+/).filter(p => p.length > 0);
                if (names.length < 2) {
                    results.push(line);
                    continue;
                }
    
                const ip = names.shift()!;
                const index = names.findIndex(n => n === test)
                if (index > -1) {
                    found = true;
                    // multiple records on the same line
                    if (names.length > 1) {
                        names.splice(index, 1);
                        results.push(`${ip} ${names.join(" ")}`);
                    } else {
                        continue;
                    }
                }
            }

            if (!found) {
                return voided();
            }

            await writeTextFile(this.#hostfile, results.join(EOL));
            return voided();
        } catch(error) {
            return coerceError(error);
        }
    }
}