import { StringMap } from "@rex/primitives/collections";
import { REX_JOBS } from "./globals.ts";
import type { Job, JobContext, JobMap } from "./primitives.ts";
import {
    type AddTaskDelegate,
    REX_TASKS,
    type RunDelegate,
    type Task,
    task as defineTask,
    type TaskBuilder,
    TaskMap,
} from "@rex/tasks";

export class JobBuilder {
    #job: Job;

    constructor(task: Job, map?: JobMap) {
        this.#job = task;
        map ??= REX_JOBS;
        map.set(task.id, task);
    }

    cwd(cwd: string | ((ctx: JobContext) => string | Promise<string>)): this {
        this.#job.cwd = cwd;
        return this;
    }

    description(description: string): this {
        this.#job.description = description;
        return this;
    }

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
     * @param taskOrId
     * @returns The current JobBuilder instance
     */
    task(taskOrId: Task | string): this {
        if (typeof taskOrId === "string") {
            const t = REX_TASKS.get(taskOrId);
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
        const get = (id: string) => REX_TASKS.get(id);
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

    force(force: boolean | ((ctx: JobContext) => boolean | Promise<boolean>)): this {
        this.#job.force = force;
        return this;
    }

    if(condition: boolean | ((ctx: JobContext) => boolean | Promise<boolean>)): this {
        this.#job.if = condition;
        return this;
    }

    timeout(timeout: number | ((ctx: JobContext) => number | Promise<number>)): this {
        this.#job.timeout = timeout;
        return this;
    }

    name(name: string): this {
        this.#job.name = name;
        return this;
    }

    needs(...needs: string[]): this {
        this.#job.needs = needs;
        return this;
    }

    build(): Job {
        return this.#job;
    }
}

/**
 * Creates a job that uses a job descriptor to execute a job.
 * @param id The id of the job
 * @param tasks The map of tasks to add the job to. Defaults to the global tasks map.
 * @returns The job builder
 */
export function job(id: string, needs?: string[]): JobBuilder {
    return new JobBuilder({
        id,
        name: id,
        tasks: [],
        needs: needs ?? [],
    });
}
