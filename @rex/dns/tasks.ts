import {
    type Task,
    TaskBuilder,
    type TaskContext,
    type TaskDef,
    type TaskMap,
    getTaskRegistry,
    toError,
} from "@rex/tasks";
import { type Inputs, Outputs } from "@rex/primitives";
import type { DnsDriverParams, DnsRecord } from "./types.ts";
import { ok, fail, type Result } from "@bearz/functional";
import { getDnsDriverRegistry, getDnsDrivers } from "./registry.ts";


const dnsDriverId = "@rex/register-dns-driver";
const updateDnsRecordsId = "@rex/update-dns-records";

export interface RegisterDnsDriverTask extends Task {
    params?: DnsDriverParams;
}

export interface RegisterDnsDriverTaskDef extends TaskDef {
    id?: string;
    with: DnsDriverParams | ((ctx: TaskContext) => Inputs | Promise<Inputs>);
}

export class RegisterDnsDriverTaskBuilder extends TaskBuilder {
    constructor(task: RegisterDnsDriverTask, map?: TaskMap) {
        super(task, map);

        if (task.params) {
            this.with(task.params.with ?? {});
        }
    }
}

export function registerDnsDriver(def: RegisterDnsDriverTaskDef, map?: TaskMap): RegisterDnsDriverTaskBuilder;
export function registerDnsDriver(
    inputs: DnsDriverParams,
    map?: TaskMap,
): RegisterDnsDriverTaskBuilder;
export function registerDnsDriver(
    inputs: DnsDriverParams,
    needs: string[],
    map?: TaskMap,
): RegisterDnsDriverTaskBuilder;
export function registerDnsDriver(
    id: string,
    inputs: DnsDriverParams,
    map?: TaskMap,
): RegisterDnsDriverTaskBuilder;
export function registerDnsDriver(
    id: string,
    inputs: DnsDriverParams,
    needs: string[],
    map?: TaskMap,
): RegisterDnsDriverTaskBuilder;
export function registerDnsDriver(): RegisterDnsDriverTaskBuilder {

    const first = arguments[0];
    const second = arguments[1];
    const uses = dnsDriverId

    if (typeof first === "object" && typeof first.with === 'function' || first.with.name) {
        const def = arguments[0] as RegisterDnsDriverTaskDef;
        let id = def.id ?? "register-dns-driver-default";
        if (!def.id && def.with.name) {
            id = `register-dns-driver-${def.with.name}`;
        }

        const tasks = getTaskRegistry();
        let i = 0;
        const old = id;
        while(tasks.has(id)) {
            id = `${old}-${i++}`;
        }

        const task: RegisterDnsDriverTask = {
            id,
            uses,
            name: def.name ?? id,
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
                task.params = def.with;
            }
        }

        return new RegisterDnsDriverTaskBuilder(task, arguments[1]);
    }

    if (typeof first === "string") {
        const id = first;
        const second = arguments[1] as DnsDriverParams;
        if (arguments[2] && Array.isArray(arguments[2])) {
            return new RegisterDnsDriverTaskBuilder({
                id,
                uses,
                needs: arguments[2] as string[],
                params: second,
            }, arguments[3]);
        }

        return new RegisterDnsDriverTaskBuilder({
            id,
            uses,
            needs: [],
            params: second,
        }, arguments[2]);
    }

    const inputs = first as DnsDriverParams;
    let id = `register-dns-driver-${inputs.name}`;
    const tasks = getTaskRegistry();
    let i = 0;
    const old = id;
    while(tasks.has(id)) {
        id = `${old}-${i++}`;
    }
 
    if (second && Array.isArray(second)) {
        return new RegisterDnsDriverTaskBuilder({
            id,
            uses,
            needs: second,
            params: inputs,
        }, arguments[2]);
    }
   
    return new RegisterDnsDriverTaskBuilder({
        id,
        uses,
        needs: [],
        params: inputs,
    }, arguments[1]);
}

const taskRegistry = getTaskRegistry();
taskRegistry.set(dnsDriverId, {
    id: dnsDriverId,
    inputs: [],
    outputs: [],
    run: async (ctx: TaskContext): Promise<Result<Outputs>> => {
        try {
            const inputs = ctx.state.inputs;

            const params : DnsDriverParams = {
                name: inputs.get("name") as string,
                use: inputs.get("use") as string | undefined,
                uri: inputs.get("uri") as string | undefined,
                replace: inputs.get("replace") as boolean | undefined,
                with: inputs.get("with") as Record<string, unknown> | undefined,
            }

            const registry = getDnsDriverRegistry();
            await registry.buildAndRegister(params);

            const o = new Outputs();
            return ok(o);
        } catch (error) {
            return fail(toError(error));
        }
    },
});

export interface UpdateDnsRecordsParams extends Record<string, unknown> {
    use: string;
    zone: string;
    records?: DnsRecord[];
    remove?: string[];
}

export interface UpdateDnsRecordsTask extends Task {
    params?: UpdateDnsRecordsParams;
}

export interface UpdateDnsRecordsTaskDef extends TaskDef {
    id: string;
    with: UpdateDnsRecordsParams | ((ctx: TaskContext) => Inputs | Promise<Inputs>);
}

export class UpdateDnsRecordsTaskBuilder extends TaskBuilder {
    constructor(task: UpdateDnsRecordsTask, map?: TaskMap) {
        super(task, map);

        if (task.params) {
            this.with(task.params);
        }
    }
}

export function updateDns(def: UpdateDnsRecordsTaskDef, map?: TaskMap): UpdateDnsRecordsTaskBuilder;
export function updateDns(id: string, inputs: UpdateDnsRecordsParams, map?: TaskMap): UpdateDnsRecordsTaskBuilder;
export function updateDns(
    id: string,
    inputs: UpdateDnsRecordsParams,
    needs: string[],
    map?: TaskMap,
): UpdateDnsRecordsTaskBuilder;
export function updateDns(): UpdateDnsRecordsTaskBuilder {
    const uses = updateDnsRecordsId;

    if (arguments.length < 2 && typeof arguments[0] === "object") {
        const def = arguments[0] as UpdateDnsRecordsTaskDef;
        const task: UpdateDnsRecordsTask = {
            id: def.id,
            uses,
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
                task.params = def.with;
            }
        }

        return new UpdateDnsRecordsTaskBuilder(task, arguments[1]);
    }

    const id = arguments[0] as string;
    const second = arguments[1];
    if (Array.isArray(second)) {
        const inputs = arguments[2] as UpdateDnsRecordsParams;
        const task: UpdateDnsRecordsTask = {
            id: id,
            uses,
            needs: second,
            params: inputs,
        };

        return new UpdateDnsRecordsTaskBuilder(task, arguments[3]);
    }

    const inputs = arguments[1] as UpdateDnsRecordsParams;
    const task: UpdateDnsRecordsTask = {
        id: id,
        uses,
        needs: [],
        params: inputs,
    };

    return new UpdateDnsRecordsTaskBuilder(task, arguments[2]);
}


taskRegistry.set(updateDnsRecordsId, {
    id: updateDnsRecordsId,
    inputs: [{
        name: "use",
        type: "string",
        required: true,
    }, {
        name: "zone",
        type: "string",
        required: true,
    }, {
        name: "records",
        type: "array",
        required: false,
    }, {
        name: "remove",
        type: "array",
        required: false,
    }],
    outputs: [],
    run: async (ctx: TaskContext): Promise<Result<Outputs>> => {
        try {
            const inputs = ctx.state.inputs;

            const zone = inputs.get("zone") as string;
            const use = inputs.get("use") as string;
            const records = inputs.get("records") as DnsRecord[] | undefined;
            const remove = inputs.get("remove") as string[] | undefined;
            if (!records && !remove) {
                throw new Error("Either records or remove must be provided");
            }

            const driver = getDnsDrivers().get(use);
            if (!driver) {
                throw new Error(`Dns driver ${use} not found`);
            }

            if (records && records.length > 0) {
                for (const record of records) {
                    await driver.setRecord(zone, record);
                }
            }

            if (remove && remove.length > 0) {
                for (const record of remove) {
                    await driver.removeRecord(zone, record);
                }
            }


            const o = new Outputs();
            o.set("use", use);
            o.set("zone", zone);
            o.set("records", records);
            o.set("remove", remove);
            return ok(o);
        } catch(error) {
            return fail(toError(error));
        }
    },
});