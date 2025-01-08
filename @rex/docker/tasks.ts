import {
    rexTaskHandlerRegistry,
    type Task,
    TaskBuilder,
    type TaskContext,
    type TaskDef,
    type TaskMap,
} from "@rex/tasks";
import { up as execUp, type UpArgs } from "./compose/up.ts";
import { down as execDown, type DownArgs } from "./compose/down.ts";
import { type InputDescriptor, type Inputs, Outputs } from "@rex/primitives";
import { ComposeInputs } from "./_common.ts";
import { fail, ok, type Result } from "@bearz/functional";

export interface ComposeUpTask extends Task {
    inputs?: UpArgs;
}

export interface ComposeUpTaskDef extends TaskDef {
    id: string;
    with: UpArgs | ((ctx: TaskContext) => Inputs | Promise<Inputs>);
}

export class ComposeUpTaskBuilder extends TaskBuilder {
    constructor(task: ComposeUpTask, map?: TaskMap) {
        super(task, map);

        if (task.inputs) {
            this.with(task.inputs);
        }
    }
}

export function up(
    id: string,
    needs: string[],
    inputs: UpArgs,
    map?: TaskMap,
): ComposeUpTaskBuilder;
export function up(id: string, inputs: UpArgs, map?: TaskMap): ComposeUpTaskBuilder;
export function up(def: ComposeUpTaskDef, map?: TaskMap): ComposeUpTaskBuilder;
export function up(): ComposeUpTaskBuilder {
    if (arguments.length < 2 && typeof arguments[0] === "object") {
        const def = arguments[0] as ComposeUpTaskDef;
        const task: ComposeUpTask = {
            id: def.id,
            uses: "@rex/compose-up",
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

        return new ComposeUpTaskBuilder(task, arguments[1]);
    }

    const id = arguments[0] as string;
    const second = arguments[1];
    if (Array.isArray(second)) {
        const needs = second as string[];
        const inputs = arguments[2] as UpArgs;
        return new ComposeUpTaskBuilder(
            { id, uses: "@rex/compose-up", needs, inputs },
            arguments[3],
        );
    }

    const inputs = second as UpArgs;
    return new ComposeUpTaskBuilder(
        { id, uses: "@rex/compose-up", inputs, needs: [] },
        arguments[2],
    );
}

const upInputs: InputDescriptor[] = [
    {
        name: "abortOnContainerExit",
        type: "boolean",
        required: false,
    },
    {
        name: "alwaysRecreateDeps",
        type: "boolean",
        required: false,
    },
    {
        name: "build",
        type: "boolean",
        required: false,
    },
    {
        name: "detach",
        type: "boolean",
        required: false,
    },
    {
        name: "dryRun",
        type: "boolean",
        required: false,
    },
    {
        name: "exitCodeFrom",
        type: "string",
        required: false,
    },
    {
        name: "forceRecreate",
        type: "boolean",
        required: false,
    },
    {
        name: "noAttach",
        type: "array",
        required: false,
    },
    {
        name: "noBuild",
        type: "boolean",
        required: false,
    },
    {
        name: "noColor",
        type: "boolean",
        required: false,
    },
    {
        name: "noDeps",
        type: "boolean",
        required: false,
    },
    {
        name: "noLogPrefix",
        type: "boolean",
        required: false,
    },
    {
        name: "noRecreate",
        type: "boolean",
        required: false,
    },
    {
        name: "noStart",
        type: "boolean",
        required: false,
    },
    {
        name: "pull",
        type: "string",
        required: false,
    },
    {
        name: "quietPull",
        type: "boolean",
        required: false,
    },
    {
        name: "removeOrphans",
        type: "boolean",
        required: false,
    },
    {
        name: "renewAnonVolumes",
        type: "boolean",
        required: false,
    },
    {
        name: "scale",
        type: "number",
        required: false,
    },
    {
        name: "services",
        type: "array",
        required: false,
    },
    {
        name: "timeout",
        type: "number",
        required: false,
    },
    {
        name: "timestamps",
        type: "boolean",
        required: false,
    },
    {
        name: "wait",
        type: "boolean",
        required: false,
    },
    {
        name: "waitTimeout",
        type: "number",
        required: false,
    },
];

const taskHandlerRegistery = rexTaskHandlerRegistry();

taskHandlerRegistery.set("@rex/compose-up", {
    id: "@rex/compose-up",
    outputs: [],
    inputs: ComposeInputs.concat(upInputs),
    run: async (ctx: TaskContext): Promise<Result<Outputs>> => {
        try {
            const inputs = ctx.state.inputs;
            const upArgs: UpArgs = {};
            for (const [k, v] of inputs) {
                upArgs[k] = v;
            }

            const r = await execUp(upArgs, {
                cwd: ctx.state.cwd,
                env: ctx.state.env.toObject(),
                signal: ctx.signal,
            }).run();

            const o = new Outputs();
            if (upArgs.file) {
                o.set("file", upArgs.file);
            }

            if (upArgs.file) {
                o.set("projectName", upArgs.projectName);
            }

            if (r.code !== 0) {
                return fail(
                    new Error(`Compose up failed. code: ${r.code} message: ${r.errorText()}`),
                );
            }

            o.set("code", r.code);

            return ok(o);
        } catch (e) {
            if (e instanceof Error) {
                return fail(e);
            }

            return fail(new Error(`Unexpected error: ${e}`));
        }
    },
});

export interface ComposeDownTask extends Task {
    inputs?: DownArgs;
}

export interface ComposeDownTaskDef extends TaskDef {
    id: string;
    with: DownArgs | ((ctx: TaskContext) => Inputs | Promise<Inputs>);
}

export class ComposeDownTaskBuilder extends TaskBuilder {
    constructor(task: ComposeDownTask, map?: TaskMap) {
        super(task, map);

        if (task.inputs) {
            this.with(task.inputs);
        }
    }
}

export function down(
    id: string,
    needs: string[],
    inputs: DownArgs,
    map?: TaskMap,
): ComposeDownTaskBuilder;
export function down(id: string, inputs: DownArgs, map?: TaskMap): ComposeDownTaskBuilder;
export function down(def: ComposeDownTaskDef, map?: TaskMap): ComposeDownTaskBuilder;
export function down(): ComposeDownTaskBuilder {
    if (arguments.length < 2 && typeof arguments[0] === "object") {
        const def = arguments[0] as ComposeDownTaskDef;
        const task: ComposeDownTask = {
            id: def.id,
            uses: "@rex/compose-down",
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

        return new ComposeDownTaskBuilder(task, arguments[1]);
    }

    const id = arguments[0] as string;
    const second = arguments[1];
    if (Array.isArray(second)) {
        const needs = second as string[];
        const inputs = arguments[2] as DownArgs;
        return new ComposeDownTaskBuilder(
            { id, uses: "@rex/compose-down", needs, inputs },
            arguments[3],
        );
    }

    const inputs = second as DownArgs;
    return new ComposeDownTaskBuilder(
        { id, uses: "@rex/compose-down", inputs, needs: [] },
        arguments[2],
    );
}

const downInputs: InputDescriptor[] = [
    {
        name: "rmi",
        type: "string",
        required: false,
    },
    {
        name: "volumes",
        type: "boolean",
        required: false,
    },
    {
        name: "removeOrphans",
        type: "boolean",
        required: false,
    },
    {
        name: "timeout",
        type: "number",
        required: false,
    },
    {
        name: "services",
        type: "array",
        required: false,
    },
];

taskHandlerRegistery.set("@rex/compose-down", {
    id: "@rex/compose-down",
    outputs: [],
    inputs: ComposeInputs.concat(downInputs),
    run: async (ctx: TaskContext): Promise<Result<Outputs>> => {
        try {
            const inputs = ctx.state.inputs;
            const downArgs: DownArgs = {};
            for (const [k, v] of inputs) {
                downArgs[k] = v;
            }

            const r = await execDown(downArgs, {
                cwd: ctx.state.cwd,
                env: ctx.state.env.toObject(),
                signal: ctx.signal,
            }).run();

            const o = new Outputs();
            if (r.code !== 0) {
                return fail(
                    new Error(`Compose down failed. code: ${r.code} message: ${r.errorText()}`),
                );
            }

            o.set("code", r.code);

            return ok(o);
        } catch (e) {
            if (e instanceof Error) {
                return fail(e);
            }

            return fail(new Error(`Unexpected error: ${e}`));
        }
    },
});
