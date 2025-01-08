import {
    rexTaskHandlerRegistry,
    type Task,
    TaskBuilder,
    type TaskContext,
    type TaskDef,
    type TaskMap,
    toError,
} from "@rex/tasks";
import { type Inputs, Outputs } from "@rex/primitives";
import { fail, ok, type Result } from "@bearz/functional";
import { twig } from "./twig.ts";
import { env } from "@bearz/env";
import { parse } from "yaml";
import { deepMerge } from "@std/collections";
import { ensureDir, readTextFile, writeTextFile } from "@bearz/fs";
import { dirname, extname, isAbsolute, resolve } from "@std/path";

export interface TwigTaskParams extends Record<string | symbol, unknown> {
    src: string;
    dest: string;
    valueFiles?: string[];
    values?: Record<string, unknown>;
}

export interface TwigTask extends Task {
    params?: TwigTaskParams;
}

export interface TwigTaskDef extends TaskDef {
    id: string;
    with: TwigTaskParams | ((ctx: TaskContext) => Inputs | Promise<Inputs>);
}

export class TwigTaskBuilder extends TaskBuilder {
    constructor(task: TwigTask, map?: TaskMap) {
        super(task, map);

        if (task.params) {
            this.with(task.params);
        }
    }
}

export function twigTask(def: TwigTaskDef, map?: TaskMap): TwigTaskBuilder;
export function twigTask(id: string, params: TwigTaskParams, map?: TaskMap): TwigTaskBuilder;
export function twigTask(
    id: string,
    params: TwigTaskParams,
    needs: string[],
    map?: TaskMap,
): TwigTaskBuilder;
export function twigTask(): TwigTaskBuilder {
    const uses = "@rex/twig";
    const first = arguments[0];
    const second = arguments[1];
    if (typeof first === "object") {
        const def = first as TwigTaskDef;

        const task: TwigTask = {
            id: def.id,
            uses,
            name: def.name ?? def.id,
            cwd: def.cwd,
            needs: def.needs ?? [],
            env: def.env,
            description: def.description,
            force: def.force,
            if: def.if,
            timeout: def.timeout,
        };

        if (typeof def.with === "function") {
            task.with = def.with;
        } else {
            task.params = def.with;
        }

        return new TwigTaskBuilder(task, second);
    }

    const id = first as string;
    const params = second as TwigTaskParams;
    const third = arguments[2];
    if (Array.isArray(third)) {
        return new TwigTaskBuilder({
            id,
            uses,
            name: id,
            params,
            needs: third,
        }, arguments[3]);
    }

    return new TwigTaskBuilder({
        id,
        uses,
        name: id,
        params,
        needs: [],
    }, arguments[2]);
}

const taskHandlerRegistery = rexTaskHandlerRegistry();

taskHandlerRegistery.set("@rex/twig", {
    id: "@rex/twig",
    inputs: [{
        name: "src",
        type: "string",
        required: true,
    }, {
        name: "dest",
        type: "string",
        required: false,
    }, {
        name: "valueFiles",
        type: "array",
        required: false,
    }, {
        name: "values",
        type: "object",
        required: false,
    }],
    outputs: [],
    async run(ctx: TaskContext): Promise<Result<Outputs>> {
        try {
            const inputs = ctx.state.inputs;
            const params: TwigTaskParams = {
                src: inputs.get("src") as string,
                dest: inputs.get("dest") as string,
                valueFiles: inputs.get("valueFiles") as string[] | undefined,
                values: inputs.get("values") as Record<string, unknown> | undefined,
            };

            const g: (key: string) => string | undefined = (key) => {
                if (ctx.state.env.get(key)) {
                    return ctx.state.env.get(key);
                }

                if (ctx.env.get(key)) {
                    return ctx.env.get(key);
                }

                return env.get(key);
            };
            const eo = { get: g };

            if (params.src.includes("$")) {
                params.src = env.expand(params.src, eo);
            }

            if (params.dest && params.dest.includes("$")) {
                params.dest = env.expand(params.dest, eo);
            }

            if (params.valueFiles) {
                for (let i = 0; i < params.valueFiles.length; i++) {
                    if (params.valueFiles[i].includes("$")) {
                        params.valueFiles[i] = env.expand(params.valueFiles[i], eo);
                    }
                }
            }

            let values: Record<string, unknown> = {};
            if (params.valueFiles?.length) {
                for (let file of params.valueFiles) {
                    if (!isAbsolute(file)) {
                        file = resolve(file);
                    }

                    const ext = extname(file);
                    const content = await readTextFile(file);
                    if (content.length === 0) {
                        ctx.writer.warn(`Task's ${ctx.state.id} value file ${file} is empty`);
                        continue;
                    }

                    switch (ext) {
                        case ".json":
                            values = deepMerge(values, JSON.parse(content));
                            break;
                        case ".yaml":
                        case ".yml":
                            values = deepMerge(values, parse(content));
                            break;
                    }
                }
            }

            if (params.values) {
                values = deepMerge(values, params.values);
            }

            values["env"] = ctx.env.toObject();
            values["secrets"] = ctx.secrets.toObject();

            if (!isAbsolute(params.src)) {
                params.src = resolve(params.src);
            }

            if (!isAbsolute(params.dest)) {
                params.dest = resolve(params.dest);
            }

            const srcContent = await readTextFile(params.src);
            const output = await twig.render(srcContent, values);

            if (params.dest) {
                const dir = dirname(params.dest);
                await ensureDir(dir);

                await writeTextFile(params.dest, output);
            }

            const o = new Outputs();
            o.set("dest", params.dest);
            o.set("src", params.src);
            return ok(o);
        } catch (error) {
            return fail(toError(error));
        }
    },
});
