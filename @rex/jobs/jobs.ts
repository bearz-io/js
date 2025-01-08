import { StringMap } from "@rex/primitives/collections";
import { rexJobs } from "./globals.ts";
import type { Job, JobContext, JobDef, JobMap } from "./types.ts";
import {
    type AddTaskDelegate,
    rexTasks,
    type RunDelegate,
    type Task,
    task as defineTask,
    type TaskBuilder,
    TaskMap,
} from "@rex/tasks";

/**
 * A monadic builder for creating jobs.
 */
export class JobBuilder {
    #job: Job;
    #map: JobMap;

    /**
     * Creates a new job builder.
     * @param task The job to build.
     * @param map The job collection to add the job to.
     */
    constructor(task: Job, map?: JobMap) {
        this.#job = task;
        map ??= rexJobs();
        this.#map = map;
        map.set(task.id, task);
    }

    /**
     * Sets multiple properties of the job.
     * @param def the job definition.
     * @returns The job builder.
     */
    set(def: JobDef): this {
        for (const key in def) {
            if (key === "tasks") {
                const tasks = def.tasks;
                if (typeof tasks === "function") {
                    this.tasks(tasks);
                    continue;
                } else {
                    this.#job.tasks = tasks;
                }

                continue;
            }

            this.#job[key] = def[key];
        }

        return this;
    }

    /**
     * Sets the current working directory for the job.
     * @param cwd The current working directory as a string.
     * @returns A reference to the current instance for method chaining.
     */
    cwd(cwd: string | ((ctx: JobContext) => string | Promise<string>)): this {
        this.#job.cwd = cwd;
        return this;
    }

    /**
     * Sets the description of the job.
     * @param description The description of the job.
     * @returns A reference to the current instance for method chaining.
     */
    description(description: string): this {
        this.#job.description = description;
        return this;
    }

    /**
     * Sets the environment variables for the job.
     * @param env The environment variables for the job.
     * @returns A reference to the current instance for method chaining
     */
    env(
        env:
            | Record<string, string>
            | StringMap
            | ((ctx: JobContext) => StringMap | Promise<StringMap>),
    ): this {
        if (env instanceof StringMap) {
            this.#job.env = env;
            return this;
        }

        if (typeof env === "function") {
            this.#job.env = env;
            return this;
        }

        this.#job.env = new StringMap();
        this.#job.env.merge(env);
        return this;
    }

    /**
     * Add a task to the job.
     * @param taskOrId The task or id of the task from the global task collection.
     * @returns The current JobBuilder instance
     */
    task(taskOrId: Task | string): this {
        if (typeof taskOrId === "string") {
            const t = rexTasks().get(taskOrId);
            if (!t) {
                throw new Error(`Task ${taskOrId} not found`);
            }
            this.#job.tasks.push(t);
            return this;
        }

        this.#job.tasks.push(taskOrId);
        return this;
    }

    /**
     * Adds tasks to the job in order.
     * @param fn A function that takes a TaskMap and adds tasks to it.
     * The first argument is the TaskMap to add tasks to.
     * The second argument is a function adds a task to the TaskMap by id.
     * The third argument is a function that gets a task by id.
     * @returns
     */
    tasks(
        fn: AddTaskDelegate,
    ): this {
        const map = new TaskMap();
        const get = (id: string) => rexTasks().get(id);
        const add = (id: string) => {
            const task = get(id);
            if (!task) {
                throw new Error(`Task ${id} not found`);
            }
            map.set(id, task);
        };

        function task(id: string, rn: RunDelegate): TaskBuilder;
        function task(id: string, needs: string[], rn: RunDelegate): TaskBuilder;
        function task(): TaskBuilder {
            switch (arguments.length) {
                case 2:
                    return defineTask(arguments[0], arguments[1], map);
                case 3:
                    return defineTask(arguments[0], arguments[1], arguments[2], map);
                default:
                    throw new Error("Invalid number of arguments.");
            }
        }

        fn(task, add, get, map);
        this.#job.tasks.push(...map.values());
        return this;
    }

    /**
     * Sets the force option for the job.
     * @param force The force option for the job.
     * @returns A reference to the current instance for method chaining.
     */
    force(force: boolean | ((ctx: JobContext) => boolean | Promise<boolean>)): this {
        this.#job.force = force;
        return this;
    }

    /**
     * Sets the if condition for the job.
     * @param condition The if condition for the job.
     * @returns A reference to the current instance for method chaining.
     */
    if(condition: boolean | ((ctx: JobContext) => boolean | Promise<boolean>)): this {
        this.#job.if = condition;
        return this;
    }

    /**
     * Sets the timeout for the job.
     *
     * @param timeout - The timeout value in milliseconds or a function that returns the timeout value.
     *                  The function can return a number or a Promise that resolves to a number.
     * @returns The current instance for chaining.
     */
    timeout(timeout: number | ((ctx: JobContext) => number | Promise<number>)): this {
        this.#job.timeout = timeout;
        return this;
    }

    /**
     * Sets the name of the job.
     * @param name The name of the job.
     * @returns A reference to the current instance for method chaining.
     */
    name(name: string): this {
        this.#job.name = name;
        return this;
    }

    /**
     * Sets the needs of the job.
     * @param needs The needs of the job.
     * @returns A reference to the current instance for method chaining.
     */
    needs(...needs: string[]): this {
        this.#job.needs = needs;
        return this;
    }

    /**
     * Builds the job.
     * @returns The job.
     */
    build(): Job {
        return this.#job;
    }
}

/**
 * A delegate job definition.
 */
export interface DelegateJobDef extends JobDef {
    /**
     * The unique identifier of the job.
     */
    id: string;
}

/**
 * Creates a job that uses a job descriptor to execute a job.
 * @param id The id of the job
 * @param fn The delegate used to add tasks to the job.
 * @param map The map of jobs to add the job to. Defaults to the global jobs map.
 * @returns The job builder
 * ```ts
 * import { job } from "@rex/jobs";
 * import { task } from "@rex/tasks";
 *
 * task("shared", _ => console.log("Shared task"));
 *
 * job("hello", (task, add, _) => {
 *      task("hello", _ => console.log("Hello"));
 *      task("world", _ => console.log("World"));
 *      add("shared");
 * })
 * ```
 */
export function job(id: string, fn: AddTaskDelegate, map?: JobMap): JobBuilder;
/**
 * Creates a job that uses a job descriptor to execute a job.
 * @param id The id of the job
 * @param fn The delegate used to add tasks to the job.
 * @param map The map of jobs to add the job to. Defaults to the global jobs map.
 * @returns The job builder
 * ```ts
 * import { job } from "@rex/jobs";
 * job("one", (task, add, _) => {
 *      task("hello", _ => console.log("Hello"));
 * })
 *
 * job("two", ["one"], (task, add, _) => {
 *      task("world", _ => console.log("World"));
 * })
 * ```
 */
export function job(id: string, needs: string[], fn: AddTaskDelegate, map?: JobMap): JobBuilder;
/**
 * Create a job using a delegate job definition.
 * @param def The delegate job definition.
 * @param map The map of jobs to add the job to. Defaults to the global jobs map.
 *
 * ```ts
 * import { job } from "@rex/jobs";
 * import { task } from "@rex/tasks";
 *
 * task("shared", _ => console.log("Shared task"));
 *
 * job({
 *   id: "hello",
 *   tasks: (task, add, _) => {
 *
 *      task("hello", _ => console.log("Hello"));
 *      task("world", _ => console.log("World"));
 *      add("shared");
 *   }
 * })
 * ```
 */
export function job(def: DelegateJobDef, map?: JobMap): JobBuilder;
export function job(): JobBuilder {
    const first = arguments[0];

    if (typeof first === "object") {
        const def: DelegateJobDef = first;

        const job: Job = {
            id: def.id,
            name: def.name ?? def.id,
            tasks: [],
            needs: def.needs,
            cwd: def.cwd,
            description: def.description,
            env: def.env,
            force: def.force,
            if: def.if,
            timeout: def.timeout,
        };

        if (typeof def.tasks === "function") {
            const builder = new JobBuilder(job, arguments[1]);
            builder.tasks(def.tasks);
            return builder;
        }

        if (def.tasks) {
            job.tasks = def.tasks;
        }

        return new JobBuilder(job, arguments[1]);
    }

    const id = first;
    const second = arguments[1];
    if (Array.isArray(second)) {
        const needs = second as string[];
        const fn = arguments[2];
        return new JobBuilder({
            id,
            name: id,
            tasks: [],
            needs,
        }, arguments[3]).tasks(fn as AddTaskDelegate);
    }

    return new JobBuilder({
        id,
        name: id,
        tasks: [],
    }, arguments[2]).tasks(second as AddTaskDelegate);
}
