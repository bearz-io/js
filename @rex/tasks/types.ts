import { fail, ok, type Result } from "@bearz/functional";
import {
    type ExecutionContext,
    type InputDescriptor,
    type Inputs,
    type Lookup,
    OrderedMap,
    type OutputDescriptor,
    Outputs,
    ProxyMap,
    type StringMap,
} from "@rex/primitives";

/**
 * Represents an executable task in the pipeline.
 */
export interface Task extends Lookup {
    /**
     * The unique identifier of the task.
     */
    id: string;

    /**
     * The name of the task. This is displayed in the ui when tasks are running.
     * Defaults to the id if not provided.
     */
    name?: string;

    /**
     * The task handler to use.
     */
    uses: string;

    /**
     * The description of the task. This will show in the cli when tasks are listed.
     */
    description?: string;

    /**
     * The inputs for the task.
     */
    with?: Inputs | ((ctx: TaskContext) => Inputs | Promise<Inputs>);

    /**
     * The environment variables to set for the task. Delegates are late bound.
     */
    env?: StringMap | ((ctx: TaskContext) => StringMap | Promise<StringMap>);

    /**
     * The working directory for the task. Delegates are late bound.
     */
    cwd?: string | ((ctx: TaskContext) => string | Promise<string>);

    /**
     * The timeout for the task in seconds. Delegates are late bound.
     * 0 means no timeout or is limited to whatever the runner is configured to use.
     */
    timeout?: number | ((ctx: TaskContext) => number | Promise<number>);

    /**
     * The condition to run the task. Delegates are late bound. If the
     * condition is false, the task will be skipped.
     */
    if?: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>);

    /**
     * Forces the task to run should a previous task fail. Delegates are late bound.
     */
    force?: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>);

    /**
     * The dependencies of the task. These tasks will run before this task
     * is executed.
     */
    needs?: string[];
}

/**
 * Represents the state of a task properties at runtime after
 * all delegates have been resolved.
 */
export interface TaskState extends Lookup {
    /**
     * The unique identifier of the task.
     */
    id: string;

    /**
     * The id of the task handler to use.
     */
    uses: string;

    /**
     * The name of the task. This is displayed in the ui when tasks are running.
     * Defaults to the id if not provided.
     */
    name: string;

    /**
     * The description of the task. This will show in the cli when tasks are listed.
     */
    description: string;

    /**
     * The inputs for the task.
     */
    inputs: Inputs;

    /**
     * The outputs for the task.
     */
    outputs: Outputs;

    /**
     * Force the task to run should a previous task fail.
     */
    force: boolean;

    /**
     * The timeout for the task in seconds.
     * 0 means no timeout or is limited to whatever the runner is configured to use.
     */
    timeout: number;

    /**
     * The condition to run the task. Delegates are late bound. If the
     * condition is false, the task will be skipped.
     */
    if: boolean;

    /**
     * The environment variables to set for the task.
     */
    env: StringMap;

    /**
     * The keys of the environment variables to set for the task
     */
    envKeys: string[];

    /**
     * The working directory for the task.
     */
    cwd: string;

    /**
     * The dependencies of the task. These tasks will run before this task
     * is executed.
     */
    needs: string[];
}

/**
 * Represents the context of a task at runtime.
 */
export interface TaskContext extends ExecutionContext {
    /**
     * The state of the task.
     */
    state: TaskState;

    /**
     * The current environment name for the task. This is passed to the runner
     * as the name of the context.
     */
    environmentName: "production" | "staging" | "development" | "test" | "default" | string;

    /**
     * The arguments passed to the runner.
     */
    args?: string[];
}

/**
 * The definition of a task typically used by functions that define a task.
 */
export interface TaskDef extends Lookup {
    /**
     * The name of the task. This is displayed in the ui when tasks are running.
     * Defaults to the id if not provided.
     */
    name?: string;

    /**
     * The description of the task. This will show in the cli when tasks are listed.
     */
    description?: string;

    /**
     * The dependencies of the task. These tasks will run before this task
     * is executed.
     */
    needs?: string[];

    /**
     * The environment variables to set for the task. Delegates are late bound.
     */
    env?: StringMap | ((ctx: TaskContext) => StringMap | Promise<StringMap>);

    /**
     * The working directory for the task. Delegates are late bound.
     */
    cwd?: string | ((ctx: TaskContext) => string | Promise<string>);

    /**
     * The timeout for the task in seconds. Delegates are late bound.
     */
    timeout?: number | ((ctx: TaskContext) => number | Promise<number>);

    /**
     * The condition to run the task. Delegates are late bound. If the
     * condition is false, the task will be skipped.
     */
    if?: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>);

    /**
     * Forces the task to run should a previous task fail. Delegates are late bound.
     */
    force?: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>);
}

/**
 * Represents a delegate function that is passed to the task handler.  This is only
 * used for code defined tasks.
 */
export type RunDelegate = (ctx: TaskContext) => Promise<Outputs> | Promise<void> | Outputs | void;

/**
 * Represents a task that that used a delegate function execute the task. The delegate
 * is passed to the task handler for it to execute.
 */
export interface DelegateTask extends Task {
    run: RunDelegate;
}

/**
 * Represents the state of a task that uses a delegate function to execute the task.
 */
export interface DelgateTaskState extends TaskState {
    run: RunDelegate;
}

/**
 * The pipeline status of a pipeline or a unit of work within a pipeline.
 */
export type PipelineStatus = "success" | "failure" | "cancelled" | "skipped";

/**
 * The task handler interface that is used to define a task handler.
 * which is responsible for executing a task.
 */
export interface TaskHandler {
    /**
     * The unique identifier of the task handler.
     */
    id: string;
    /**
     * The url to import the task handler from.
     */
    import?: string;
    /**
     * The default description of the task.
     */
    description?: string;
    /**
     * The defined inputs for the task.
     */
    inputs: InputDescriptor[];
    /**
     * The defined outputs for the task.
     */
    outputs: OutputDescriptor[];
    /**
     * Executes the task.
     * @param ctx The task context.
     * @returns The outputs of the task.
     */
    run(ctx: TaskContext): Promise<Result<Outputs>>;
}

/**
 * Represents the result of a task execution.
 */
export class TaskResult {
    /**
     * The unique identifier of the task.
     */
    id: string;
    /**
     * The outputs of the task.
     */
    outputs: Outputs;
    /**
     * The status of the task
     */
    status: PipelineStatus;

    /**
     * The error that occurred during the task execution.
     */
    error?: Error;

    /**
     * The time the task started.
     */
    startedAt: Date;

    /**
     * The time the task finished.
     */
    finishedAt: Date;

    /**
     * Creates a new `TaskResult` instance.
     * @param id The unique identifier of the task.
     */
    constructor(id: string) {
        this.id = id;
        this.outputs = new Outputs();
        this.status = "success";
        this.error = undefined;
        this.startedAt = new Date();
        this.finishedAt = this.startedAt;
    }

    /**
     * Starts tracking the execution of a task.
     * @returns The task result.
     */
    start(): this {
        this.startedAt = new Date();
        return this;
    }

    /**
     * Stops tracking the execution of a task.
     * @returns The task result.
     */
    stop(): this {
        this.finishedAt = new Date();
        return this;
    }

    /**
     * Marks the task as failed.
     * @param err The error that occurred.
     * @returns The task result.
     */
    fail(err: Error): this {
        this.status = "failure";
        this.error = err;
        return this;
    }

    /**
     * Marks the task as cancelled.
     * @returns The task result.
     */
    cancel(): this {
        this.status = "cancelled";
        return this;
    }

    /**
     * Marks the task as skipped.
     * @returns The task result.
     */
    skip(): this {
        this.status = "skipped";
        return this;
    }

    /**
     * Marks the task as successful.
     * @param outputs The outputs of the task.
     * @returns The task result.
     */
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

        const needs = task.needs ?? [];
        for (const dep of needs) {
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

/**
 * Represents an ordered collection of tasks.
 */
export class TaskMap extends OrderedMap<string, Task> {
    static fromObject(obj: Record<string, Task>): TaskMap {
        const map = new TaskMap();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key, value);
        }
        return map;
    }

    /**
     * Determines if any of the tasks in the collection has any missing dependencies.
     * @returns Tasks with missing dependencies.
     */
    missingDependencies(): Array<{ task: Task; missing: string[] }> {
        const missing = new Array<{ task: Task; missing: string[] }>();
        for (const task of this.values()) {
            if (!task.needs) {
                continue;
            }

            const missingDeps = task.needs.filter((dep) => !this.has(dep));
            if (missingDeps.length > 0) {
                missing.push({ task, missing: missingDeps });
            }
        }
        return missing;
    }

    /**
     * Flattens the list of tasks in the collection so that
     * the tasks are in the correct order of execution.
     *
     * @param targets The targets (ids) of the tasks to flatten. If
     * not provided, all tasks are flattened.
     * @returns The flattened list of tasks.
     */
    flatten(targets?: Task[]): Result<Task[]> {
        targets = targets ?? Array.from(this.values());
        return flatten(this, targets);
    }

    /**
     * Finds tasks that have cyclical references.
     * @returns The tasks that have cyclical references.
     */
    findCyclycalReferences(): Task[] {
        const stack = new Set<Task>();
        const cycles = new Array<Task>();
        const resolve = (task: Task) => {
            if (stack.has(task)) {
                return false;
            }

            stack.add(task);
            const needs = task.needs ?? [];
            for (const dep of needs) {
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

/**
 * Represents a registry of task handlers.
 */
export class TaskHandlerRegistry extends ProxyMap<TaskHandler> {
    /**
     * Creates a new instance of the `TaskHandlerRegistry` class.
     * @param obj The object to create the registry from.
     */
    static fromObject(obj: Record<string, TaskHandler>): TaskHandlerRegistry {
        const map = new TaskHandlerRegistry();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key, value);
        }
        return map;
    }

    /**
     * Registers a task handler.
     * @param task The task handler to register.
     */
    register(task: TaskHandler): void {
        if (this.has(task.id)) {
            throw new Error(`Task ${task.id} already exists`);
        }

        this.set(task.id, task);
    }
}
