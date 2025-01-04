import { fail, ok, type Result } from "@bearz/functional";
import {
    type ExecutionContext,
    type InputDescriptor,
    type Inputs,
    OrderedMap,
    type OutputDescriptor,
    Outputs,
    ProxyMap,
    type StringMap,
} from "@rex/primitives";

export interface TaskState extends Record<string, unknown> {
    id: string;

    uses: string;

    name: string;

    description: string;

    inputs: Inputs;

    outputs: Outputs;

    force: boolean;

    timeout: number;

    if: boolean;

    env: StringMap;

    cwd: string;

    needs: string[];
}

export interface TaskContext extends ExecutionContext {
    state: TaskState;

    environmentName: "production" | "staging" | "development" | "test" | "local" | string;

    args?: string[];
}

export interface Task extends Record<string, unknown> {
    id: string;

    name?: string;

    uses: string;

    description?: string;

    with?: Inputs | ((ctx: TaskContext) => Inputs | Promise<Inputs>);

    env?: StringMap | ((ctx: TaskContext) => StringMap | Promise<StringMap>);

    cwd?: string | ((ctx: TaskContext) => string | Promise<string>);

    timeout?: number | ((ctx: TaskContext) => number | Promise<number>);

    if?: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>);

    force?: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>);

    needs: string[];
}

export interface TaskDef extends Record<string, unknown> {
    name?: string;

    description?: string;

    needs?: string[];

    env?: StringMap | ((ctx: TaskContext) => StringMap | Promise<StringMap>);

    cwd?: string | ((ctx: TaskContext) => string | Promise<string>);

    timeout?: number | ((ctx: TaskContext) => number | Promise<number>);

    if?: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>);

    force?: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>);
}

export type RunDelegate = (ctx: TaskContext) => Promise<Outputs> | Promise<void> | Outputs | void;

export interface DelgateTaskState extends TaskState {
    run: RunDelegate;
}

export interface DelegateTask extends Task {
    run: RunDelegate;
}

export type PipelineStatus = "success" | "failure" | "cancelled" | "skipped";

export interface TaskDescriptor {
    id: string;
    import?: string;
    description?: string;
    inputs: InputDescriptor[];
    outputs: OutputDescriptor[];
    run(ctx: TaskContext): Promise<Result<Outputs>>;
}

export class TaskResult {
    id: string;
    outputs: Outputs;
    status: PipelineStatus;
    error?: Error;
    startedAt: Date;
    finishedAt: Date;

    constructor(id: string) {
        this.id = id;
        this.outputs = new Outputs();
        this.status = "success";
        this.error = undefined;
        this.startedAt = new Date();
        this.finishedAt = this.startedAt;
    }

    start(): this {
        this.startedAt = new Date();
        return this;
    }

    stop(): this {
        this.finishedAt = new Date();
        return this;
    }

    fail(err: Error): this {
        this.status = "failure";
        this.error = err;
        return this;
    }

    cancel(): this {
        this.status = "cancelled";
        return this;
    }

    skip(): this {
        this.status = "skipped";
        return this;
    }

    success(outputs?: Record<string, unknown>): this {
        if (outputs) {
            this.outputs.merge(outputs);
        }
        return this;
    }
}

function flatten(map: TaskMap, set: Task[]): Result<Task[]> {
    const results = new Array<Task>();
    for (const task of set) {
        if (!task) {
            continue;
        }

        for (const dep of task.needs) {
            const depTask = map.get(dep);
            if (!depTask) {
                return fail(new Error(`Task ${task.id} depends on missing task ${dep}`));
            }

            const depResult = flatten(map, [depTask]);
            if (depResult.isError) {
                return depResult;
            }

            results.push(...depResult.unwrap());
            if (!results.includes(depTask)) {
                results.push(depTask);
            }
        }

        if (!results.includes(task)) {
            results.push(task);
        }
    }

    return ok(results);
}

export class TaskMap extends OrderedMap<string, Task> {
    static fromObject(obj: Record<string, Task>): TaskMap {
        const map = new TaskMap();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key, value);
        }
        return map;
    }

    missingDependencies(): Array<{ task: Task; missing: string[] }> {
        const missing = new Array<{ task: Task; missing: string[] }>();
        for (const task of this.values()) {
            const missingDeps = task.needs.filter((dep) => !this.has(dep));
            if (missingDeps.length > 0) {
                missing.push({ task, missing: missingDeps });
            }
        }
        return missing;
    }

    flatten(targets?: Task[]): Result<Task[]> {
        targets = targets ?? Array.from(this.values());
        return flatten(this, targets);
    }

    findCyclycalReferences(): Task[] {
        const stack = new Set<Task>();
        const cycles = new Array<Task>();
        const resolve = (task: Task) => {
            if (stack.has(task)) {
                return false;
            }

            stack.add(task);
            for (const dep of task.needs) {
                const depTask = this.get(dep);
                if (!depTask) {
                    continue;
                }

                if (!resolve(depTask)) {
                    return false;
                }
            }

            stack.delete(task);

            return true;
        };

        for (const task of this.values()) {
            if (!resolve(task)) {
                // cycle detected
                cycles.push(task);
            }
        }

        // no cycles detected
        return cycles;
    }
}

export class TaskRegistry extends ProxyMap<TaskDescriptor> {
    static fromObject(obj: Record<string, TaskDescriptor>): TaskRegistry {
        const map = new TaskRegistry();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key, value);
        }
        return map;
    }

    register(task: TaskDescriptor): void {
        if (this.has(task.id)) {
            throw new Error(`Task ${task.id} already exists`);
        }

        this.set(task.id, task);
    }
}
