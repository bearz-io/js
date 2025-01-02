import {
    REX_TASKS_REGISTRY,
    type Task,
    TaskBuilder,
    type TaskContext,
    type TaskDef,
    type TaskMap,
} from "@rex/tasks";
import { type Inputs, Outputs } from "@rex/primitives";
import type { DnsRecord } from "./types.ts";
import { ok, Result } from "@bearz/functional";

export interface LoadDnsDriverInputs {
    name: string;
    use: string;
    with: Record<string, unknown>;
}

export interface LoadDnsDriverTask extends Task {
    inputs?: LoadDnsDriverInputs;
}

export interface LoadDnsDriverTaskDef extends TaskDef {
    with: LoadDnsDriverInputs | ((ctx: TaskContext) => Inputs | Promise<Inputs>);
}

export class LoadDnsDriverTaskBuilder extends TaskBuilder {
    constructor(task: LoadDnsDriverTask, map?: TaskMap) {
        super(task, map);

        if (task.inputs) {
            this.with(task.inputs.with ?? {});
        }
    }
}

export function dnsDriver(def: LoadDnsDriverTaskDef, map?: TaskMap): LoadDnsDriverTaskBuilder;
export function dnsDriver(
    id: string,
    needs: string[],
    inputs: LoadDnsDriverInputs,
    map?: TaskMap,
): LoadDnsDriverTaskBuilder;
export function dnsDriver(
    id: string,
    inputs: LoadDnsDriverInputs,
    map?: TaskMap,
): LoadDnsDriverTaskBuilder;
export function dnsDriver(): LoadDnsDriverTaskBuilder {
    if (arguments.length < 2 && typeof arguments[0] === "object") {
        const def = arguments[0] as LoadDnsDriverTaskDef;
        const task: LoadDnsDriverTask = {
            id: def.id,
            uses: "@rex/load-dns-driver",
            needs: def.needs ?? [],
            cwd: def.cwd,
            description: def.description,
            env: def.env,
            force: def.force,
            if: def.if,
            timeout: def.timeout,
        };

        if (def.with) {
            if (typeof def.with === "function") {
                task.with = def.with;
            } else {
                task.inputs = def.with;
            }
        }

        return new LoadDnsDriverTaskBuilder(task, arguments[1]);
    }

    const id = arguments[0] as string;
    const second = arguments[1];
    if (Array.isArray(second)) {
        const inputs = arguments[2] as LoadDnsDriverInputs;
        const task: LoadDnsDriverTask = {
            id: id,
            uses: "@rex/load-dns-driver",
            needs: second,
            inputs: inputs,
        };

        return new LoadDnsDriverTaskBuilder(task, arguments[3]);
    }

    const inputs = arguments[1] as LoadDnsDriverInputs;
    const task: LoadDnsDriverTask = {
        id: id,
        uses: "@rex/load-dns-driver",
        needs: [],
        inputs: inputs,
    };

    return new LoadDnsDriverTaskBuilder(task, arguments[2]);
}

REX_TASKS_REGISTRY.set("@rex/load-dns-driver", {
    id: "@rex/load-dns-driver",
    inputs: [],
    outputs: [],
    run: async (ctx: TaskContext): Promise<Result<Outputs>> => {
        return ok(new Outputs());
    },
});

export interface DnsRecordInputs extends Record<string, unknown> {
    use: string;
    zone: string;
    records?: DnsRecord[];
    remove?: string[];
}

export interface DnsRecordTask extends Task {
    inputs?: DnsRecordInputs;
}

export interface DnsRecordTaskDef extends TaskDef {
    with: DnsRecordInputs | ((ctx: TaskContext) => Inputs | Promise<Inputs>);
}

export class DnsRecordTaskBuilder extends TaskBuilder {
    constructor(task: DnsRecordTask, map?: TaskMap) {
        super(task, map);

        if (task.inputs) {
            this.with(task.inputs);
        }
    }
}

export function dnsRecord(def: DnsRecordTaskDef, map?: TaskMap): DnsRecordTaskBuilder;
export function dnsRecord(
    id: string,
    needs: string[],
    inputs: DnsRecordInputs,
    map?: TaskMap,
): DnsRecordTaskBuilder;
export function dnsRecord(id: string, inputs: DnsRecordInputs, map?: TaskMap): DnsRecordTaskBuilder;
export function dnsRecord(): DnsRecordTaskBuilder {
    if (arguments.length < 2 && typeof arguments[0] === "object") {
        const def = arguments[0] as DnsRecordTaskDef;
        const task: DnsRecordTask = {
            id: def.id,
            uses: "@rex/dns-record",
            needs: def.needs ?? [],
            cwd: def.cwd,
            description: def.description,
            env: def.env,
            force: def.force,
            if: def.if,
            timeout: def.timeout,
        };

        if (def.with) {
            if (typeof def.with === "function") {
                task.with = def.with;
            } else {
                task.inputs = def.with;
            }
        }

        return new DnsRecordTaskBuilder(task, arguments[1]);
    }

    const id = arguments[0] as string;
    const second = arguments[1];
    if (Array.isArray(second)) {
        const inputs = arguments[2] as DnsRecordInputs;
        const task: DnsRecordTask = {
            id: id,
            uses: "@rex/dns-record",
            needs: second,
            inputs: inputs,
        };

        return new DnsRecordTaskBuilder(task, arguments[3]);
    }

    const inputs = arguments[1] as DnsRecordInputs;
    const task: DnsRecordTask = {
        id: id,
        uses: "@rex/dns-record",
        needs: [],
        inputs: inputs,
    };

    return new DnsRecordTaskBuilder(task, arguments[2]);
}
