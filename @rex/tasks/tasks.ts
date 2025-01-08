import { Inputs, Outputs, StringMap } from "@rex/primitives";
import { rexTaskHandlerRegistry, rexTasks } from "./globals.ts";
import type { DelegateTask, RunDelegate, Task, TaskContext, TaskDef, TaskMap } from "./types.ts";
import { fail, ok, type Result } from "@bearz/functional";

export function toError(e: unknown): Error {
    return e instanceof Error ? e : new Error(`Unkown error: ${e}`);
}

/**
 * A task that executes a delegate function.
 */
export interface DelegateTaskDef extends TaskDef {
    /**
     * The unique identifier of the task.
     */
    id: string;
    /**
     * The function that is executed by the task.
     */
    run: RunDelegate;
}

/**
 * A monadic builder for creating tasks.
 */
export class TaskBuilder {
    #task: Task;

    /**
     * Creates a new task builder.
     * @param task The task to build.
     * @param map The task collection to add the task to.
     */
    constructor(task: Task, map?: TaskMap) {
        this.#task = task;
        map ??= rexTasks();
        map.set(task.id, task);
    }

    /**
     * Sets multiple properties of the task.
     * @param def the task definition.
     * @returns The task builder.
     */
    set(def: TaskDef): this {
        this.#task = { ...this.#task, ...def };
        return this;
    }

    /**
     * Sets the current working directory for the task.
     *
     * @param cwd - The current working directory as a string or
     *  function that returns a string or a Promise that resolves to a string.
     * @returns The current instance for method chaining.
     */
    cwd(cwd: string | ((ctx: TaskContext) => string | Promise<string>)): this {
        this.#task.cwd = cwd;
        return this;
    }

    /**
     * Sets the description of the task.
     * @param description The description of the task.
     * @returns The current instance for method chaining.
     */
    description(description: string): this {
        this.#task.description = description;
        return this;
    }

    /**
     * Sets the environment variables for the task.
     * @param env The environment variables to set.
     * @returns The current instance for method chaining.
     */
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

    /**
     * Sets the force flag for the task.
     * @param force The force flag.
     * @returns The current instance for method chaining.
     */
    force(force: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>)): this {
        this.#task.force = force;
        return this;
    }

    /**
     * Sets a condition for the task.
     *
     * @param condition - A boolean value or a function that takes
     * a `TaskContext` and returns a boolean or a Promise that resolves to a boolean.
     * @returns The current instance for chaining.
     */
    if(condition: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>)): this {
        this.#task.if = condition;
        return this;
    }

    /**
     * Sets the timeout for the task.
     *
     * @param timeout - The timeout in seconds or a function that takes
     * a `TaskContext` and returns a timeout in seconds or a Promise that resolves to a timeout in seconds.
     * @returns The current instance for chaining.
     */
    timeout(timeout: number | ((ctx: TaskContext) => number | Promise<number>)): this {
        this.#task.timeout = timeout;
        return this;
    }

    /**
     * Sets the inputs for the task.
     * @param inputs The inputs for the task.
     * @returns The current instance for method chaining.
     */
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

    /**
     * Sets the name of the task.
     * @param name The name of the task.
     * @returns The current instance for method chaining.
     */
    name(name: string): this {
        this.#task.name = name;
        return this;
    }

    /**
     * Sets the dependencies for the task.
     * @param needs The dependencies for the task.
     * @returns The current instance for method chaining.
     */
    needs(...needs: string[]): this {
        this.#task.needs = needs;
        return this;
    }

    /**
     * Builds the task.
     * @returns The task.
     */
    build(): Task {
        return this.#task;
    }
}

/**
 * Creates a task that uses a task descriptor to execute a task.
 * @param id The id of the task
 * @param uses The task handler to use. This is a key that points to a task definition.
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

/**
 * Creates a delegate task that executes a function.
 * @param id The id of the task.
 * @param needs The dependencies of the task.
 * @param rn The run function of the task.
 * @param tasks The map of tasks to add the task to. Defaults to the global tasks map.
 *
 * ```ts
 * import { task } from "@rex/tasks";
 *
 * task("hello", (ctx) => {
 *      console.log("Hello");
 * });
 *
 * task("world", ["hello"], (ctx) => {
 *      console.log("World");
 * });
 * ```
 */
export function task(id: string, needs: string[], rn: RunDelegate, tasks?: TaskMap): TaskBuilder;
/**
 * Creates a delegate task that executes a function.
 * @param id The id of the task.
 * @param rn The run function of the task.
 * @param tasks The map of tasks to add the task to. Defaults to the global tasks map.
 *
 * ```ts
 * import { task } from "@rex/tasks";
 *
 * task("hello", (ctx) => {
 *      console.log("Hello");
 * });
 * ```
 */
export function task(id: string, fn: RunDelegate, tasks?: TaskMap): TaskBuilder;
/**
 * Creates a delegate task that executes a function.
 * @param def The task definition.
 * @param tasks The map of tasks to add the task to. Defaults to the global tasks map.
 *
 * ```ts
 * import { task } from "@rex/tasks";
 *
 * task({
 *   id: "hello",
 *   run: (ctx) => {
 *      console.log("Hello");
 *   }
 * });
 * ```
 */
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

const taskRegistry = rexTaskHandlerRegistry();
taskRegistry.set("@rex/delegate-task", {
    id: "@rex/delegate-task",
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

                return ok(new Outputs());
            }

            if (res instanceof Outputs) {
                return ok(res);
            }

            return ok(new Outputs());
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
