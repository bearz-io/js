import { Inputs, Outputs, StringMap } from "@rex/primitives";
import { getGlobalTasks, getTaskHandlerRegistry } from "./globals.ts";
import type {
    DelegateTask,
    RunDelegate,
    Task,
    TaskContext,
    TaskDef,
    TaskMap,
} from "./primitives.ts";
import { fail, ok, type Result } from "@bearz/functional";

export function output(data: Record<string, unknown> | Outputs): Outputs {
    if (data instanceof Outputs) {
        return data;
    }

    const outputs = new Outputs();
    outputs.merge(data);
    return outputs;
}

export function toError(e: unknown): Error {
    return e instanceof Error ? e : new Error(`Unkown error: ${e}`);
}

export interface DelegateTaskDef extends TaskDef {
    id: string;
    run: RunDelegate;
}

export class TaskBuilder {
    #task: Task;

    constructor(task: Task, map?: TaskMap) {
        this.#task = task;
        map ??= getGlobalTasks();
        map.set(task.id, task);
    }

    set(def: Omit<DelegateTaskDef, "id" | "run">): this {
        this.#task = { ...this.#task, ...def };
        return this;
    }

    cwd(cwd: string | ((ctx: TaskContext) => string | Promise<string>)): this {
        this.#task.cwd = cwd;
        return this;
    }

    description(description: string): this {
        this.#task.description = description;
        return this;
    }

    env(
        env:
            | Record<string, string>
            | StringMap
            | ((ctx: TaskContext) => StringMap | Promise<StringMap>),
    ): this {
        if (env instanceof StringMap) {
            this.#task.env = env;
            return this;
        }

        if (typeof env === "function") {
            this.#task.env = env;
            return this;
        }

        this.#task.env = new StringMap();
        this.#task.env.merge(env);
        return this;
    }

    force(force: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>)): this {
        this.#task.force = force;
        return this;
    }

    if(condition: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>)): this {
        this.#task.if = condition;
        return this;
    }

    timeout(timeout: number | ((ctx: TaskContext) => number | Promise<number>)): this {
        this.#task.timeout = timeout;
        return this;
    }

    with(
        inputs: Record<string, unknown> | Inputs | ((ctx: TaskContext) => Inputs | Promise<Inputs>),
    ): this {
        if (inputs instanceof Inputs) {
            this.#task.with = inputs;
            return this;
        }

        if (typeof inputs === "function") {
            this.#task.with = inputs;
            return this;
        }

        this.#task.with = new Inputs();
        this.#task.with.merge(inputs);
        return this;
    }

    name(name: string): this {
        this.#task.name = name;
        return this;
    }

    needs(...needs: string[]): this {
        this.#task.needs = needs;
        return this;
    }

    build(): Task {
        return this.#task;
    }
}

/**
 * Creates a task that uses a task descriptor to execute a task.
 * @param id The id of the task
 * @param uses The task to use. This is a key that points to a task definition.
 * @param tasks The map of tasks to add the task to. Defaults to the global tasks map.
 * @returns The task builder
 */
export function usesTask(id: string, uses: string, tasks?: TaskMap): TaskBuilder {
    return new TaskBuilder({
        id: id,
        uses: uses,
        name: id,
        needs: [],
    }, tasks);
}

export function task(id: string, needs: string[], rn: RunDelegate, tasks?: TaskMap): TaskBuilder;
export function task(id: string, fn: RunDelegate, tasks?: TaskMap): TaskBuilder;
export function task(def: DelegateTaskDef, tasks?: TaskMap): TaskBuilder;
export function task(): TaskBuilder {
    if (arguments.length < 1) {
        throw new Error("Invalid arguments");
    }

    if (typeof arguments[0] === "object") {
        const def = arguments[0] as DelegateTaskDef;
        def.uses = "delegate-task";
        if (!def.name) {
            def.name = def.id;
        }
        if (!def.needs) {
            def.needs = [];
        }

        return new TaskBuilder(def as DelegateTask, arguments[1]);
    }
    const id = arguments[0];
    let fn = arguments[1];
    let tasks: TaskMap | undefined = undefined;
    let needs: string[] = [];
    if (Array.isArray(fn)) {
        needs = fn;
        fn = arguments[2];
        if (arguments.length === 4) {
            tasks = arguments[3];
        }
    } else {
        if (arguments.length === 3) {
            tasks = arguments[2];
        }
    }

    const task: DelegateTask = {
        id: id,
        uses: "delegate-task",
        name: id,
        needs: needs,
        run: fn,
    };

    return new TaskBuilder(task, tasks);
}

const taskRegistry = getTaskHandlerRegistry();
taskRegistry.set("delegate-task", {
    id: "delegate-task",
    description: "an inline task",
    inputs: [{
        name: "shell",
        description: "The shell to use",
        required: false,
        type: "string",
    }],
    outputs: [],
    run: async (ctx: TaskContext): Promise<Result<Outputs>> => {
        const task = ctx.task as DelegateTask;
        if (task.run === undefined) {
            return fail(new Error(`Task ${task.id} has no run function`));
        }

        try {
            const res = task.run(ctx);
            if (res instanceof Promise) {
                const out = await res;
                if (out instanceof Outputs) {
                    return ok(out);
                }

                return ok(output({}));
            }

            if (res instanceof Outputs) {
                return ok(res);
            }

            return ok(output({}));
        } catch (e) {
            return fail(toError(e));
        }
    },
});

export type DefineTask = (id: string, rn: RunDelegate) => TaskBuilder;

/**
 * A function that adds a task to a deployment.
 *
 * @param task The task to add.
 * @param add A function that adds a task to the deployment.
 * @param get A function that gets a task from the deployment.
 */
export type AddTaskDelegate = (
    task: DefineTask,
    add: (id: string) => void,
    get: (id: string) => Task | undefined,
    map: TaskMap,
) => void;
