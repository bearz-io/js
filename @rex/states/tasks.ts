import {
    getTaskHandlerRegistry,
    type Task,
    TaskBuilder,
    type TaskContext,
    type TaskDef,
    type TaskMap,
    toError,
} from "@rex/tasks";
import { type Inputs, Outputs } from "@rex/primitives";
import { fail, ok, type Result } from "@bearz/functional";
import { getStatesRegistry } from "./registry.ts";
import type { StateDriverParams } from "./types.ts";
import { env } from "@bearz/env";

const registerStateDriverId = "@rex/register-state-driver";

export interface RegisterStateStoreTask extends Task {
    /**
     * The parameters for the state driver. This is not
     * used by YAML tasks.
     */
    inputs?: StateDriverParams;
}

export interface RegisterStateStoreTaskDef extends TaskDef {
    id?: string;
    with: StateDriverParams | ((ctx: TaskContext) => Inputs | Promise<Inputs>);
}

export class RegisterStateStoreTaskBuilder extends TaskBuilder {
    constructor(task: RegisterStateStoreTask, map?: TaskMap) {
        super(task, map);

        if (task.inputs) {
            this.with(task.inputs.with ?? {});
        }
    }
}

/**
 * Registers a state store using a task definition.  This overload is
 * typically used for YAML tasks, complex configuration or dynamic
 * late bound configuration for the `with` property.
 * @param def the task definition
 * @param map The task map to register the task with.
 */
export function registerStateStore(
    def: RegisterStateStoreTaskDef,
    map?: TaskMap,
): RegisterStateStoreTaskBuilder;
/**
 * @param params The parameters for the state driver.
 * @param map
 */
export function registerStateStore(
    params: StateDriverParams,
    map?: TaskMap,
): RegisterStateStoreTaskBuilder;
export function registerStateStore(
    params: StateDriverParams,
    needs: string[],
    map?: TaskMap,
): RegisterStateStoreTaskBuilder;
export function registerStateStore(
    id: string,
    params: StateDriverParams,
    map?: TaskMap,
): RegisterStateStoreTaskBuilder;
export function registerStateStore(
    id: string,
    params: StateDriverParams,
    needs: string[],
    map?: TaskMap,
): RegisterStateStoreTaskBuilder;
export function registerStateStore(): RegisterStateStoreTaskBuilder {
    const uses = registerStateDriverId;
    const first = arguments[0];
    const second = arguments[1];

    if (typeof first === "object") {
        if (first.with !== undefined && typeof first.with === "function" || first.with.name) {
            const def = arguments[0] as RegisterStateStoreTaskDef;
            const w = def.with;
            const isFunction = typeof w === "function";
            const replace = !isFunction && w.replace;
            const map = arguments[1] as TaskMap ?? getTaskHandlerRegistry();
            let id = "";

            if (def.id) {
                id = def.id;
                if (!replace && map.has(id)) {
                    throw new Error(`Task ${id} already exists`);
                }
            } else {
                let id = "register-state";
                if (!isFunction) {
                    id = `register-state-${w.name}`;
                }

                const exists = map.has(id);
                if (exists) {
                    if (!replace) {
                        throw new Error(`Task ${id} already exists`);
                    }

                    let i = 0;
                    const old = id;
                    while (map.has(id)) {
                        id = `${old}-${i++}`;
                    }
                }
            }

            const task: RegisterStateStoreTask = {
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

            if (isFunction) {
                task.with = w;
            } else {
                task.inputs = w;
            }

            return new RegisterStateStoreTaskBuilder(task, map);
        } else {
            const inputs = first as StateDriverParams;
            let id = `register-state-${inputs.name}`;
            const isArray = Array.isArray(second);
            const map = arguments[isArray ? 2 : 1] as TaskMap ?? getTaskHandlerRegistry();
            if (map.has(id)) {
                if (!inputs.replace) {
                    let i = 0;
                    const old = id;
                    while (map.has(id)) {
                        id = `${old}-${i++}`;
                    }
                }
            }

            if (Array.isArray(second)) {
                const needs = second as string[];
                return new RegisterStateStoreTaskBuilder({
                    id,
                    uses,
                    needs,
                    inputs,
                }, map);
            }

            return new RegisterStateStoreTaskBuilder({
                id,
                uses,
                inputs,
                needs: [],
            }, map);
        }
    }

    const id = first as string;
    const inputs = second as StateDriverParams;
    const third = arguments[2];
    if (Array.isArray(third)) {
        const needs = third as string[];
        return new RegisterStateStoreTaskBuilder({
            id,
            uses,
            needs,
            inputs,
        }, arguments[3]);
    }

    return new RegisterStateStoreTaskBuilder({
        id,
        uses,
        needs: [],
        inputs,
    }, arguments[2]);
}

const tasksRegistry = getTaskHandlerRegistry();

tasksRegistry.set(registerStateDriverId, {
    id: registerStateDriverId,
    inputs: [{
        name: "name",
        type: "string",
        description:
            "The name of the state driver. This is used to reference the driver in other tasks.",
        required: true,
    }, {
        name: "use",
        type: "string",
        description: "The name of the state driver loader to use. Defaults to file",
        default: "file",
    }, {
        name: "update",
        type: "boolean",
        description: "If the state driver already exists, should it be replaced?",
        default: false,
    }, {
        name: "with",
        type: "object",
        description: "The configuration for the state driver",
    }],
    outputs: [{
        name: "use",
        type: "string",
    }, {
        name: "name",
        type: "string",
    }],
    run: async (ctx): Promise<Result<Outputs>> => {
        try {
            const inputs = ctx.state.inputs;

            const g: (key: string) => string | undefined = (key) => {
                if (ctx.state.env.get(key)) {
                    return ctx.state.env.get(key);
                }

                if (ctx.env.get(key)) {
                    return ctx.env.get(key);
                }

                return env.get(key);
            };

            const w = inputs.get("with") as Record<string, unknown> | undefined;
            if (w) {
                for (const key of Object.keys(w)) {
                    let value = w[key];
                    if (typeof value === "string" && value.includes("$")) {
                        value = env.expand(value, {
                            get: g,
                        });
                    }

                    w[key] = value;
                }
            }

            let uri = inputs.get("uri") as string | undefined;
            if (uri) {
                if (uri.includes("$")) {
                    uri = env.expand(uri, {
                        get: g,
                    });
                }
            }

            const params: StateDriverParams = {
                name: inputs.get("name") as string ?? "default",
                use: inputs.get("use") as string | undefined,
                uri,
                with: w,
                replace: inputs.get("update") as boolean ?? false,
            };

            const registry = getStatesRegistry();

            if (!params.replace && registry.has(params.name)) {
                return fail(new Error(`State driver ${params.name} already exists`));
            }

            await registry.buildAndRegister(params);
            const o = new Outputs();
            o.set("use", params.use ?? "");
            o.set("name", name);
            return ok(o);
        } catch (error) {
            return fail(toError(error));
        }
    },
});
