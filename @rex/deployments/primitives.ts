// TODO: Write module code here

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
import type { PipelineStatus, Task, TaskResult, TaskState } from "@rex/tasks";

export interface DeploymentState extends TaskState {
    uses: "docker" | string;

    deploy: true;

    /**
     * The other services that this service
     * depends on, which are run before this service.
     */
    needs: string[];
}

export interface DeploymentContext extends ExecutionContext {
    state: DeploymentState;
    events: Record<string | symbol, DeploymentEventHandler>;
    environmentName: "development" | "staging" | "production" | "test" | "local" | string;
}

export interface Deployment extends Record<string, unknown> {
    id: string;

    name?: string;

    uses: string;

    description?: string;

    with?: Inputs | ((ctx: DeploymentContext) => Inputs | Promise<Inputs>);

    env?: StringMap | ((ctx: DeploymentContext) => StringMap | Promise<StringMap>);

    cwd?: string | ((ctx: DeploymentContext) => string | Promise<string>);

    timeout?: number | ((ctx: DeploymentContext) => number | Promise<number>);

    if?: boolean | ((ctx: DeploymentContext) => boolean | Promise<boolean>);

    force?: boolean | ((ctx: DeploymentContext) => boolean | Promise<boolean>);

    needs: string[];

    hooks: {
        "before:deploy": Task[];
        "after:deploy": Task[];
        [key: string]: Task[];
    };
}

export class DeploymentResult {
    outputs: Outputs;
    status: PipelineStatus;
    error?: Error;
    startedAt: Date;
    finishedAt: Date;
    id: string;
    taskResults: TaskResult[];

    constructor(id: string) {
        this.id = id;
        this.outputs = new Outputs();
        this.status = "success";
        this.error = undefined;
        this.startedAt = new Date();
        this.finishedAt = this.startedAt;
        this.taskResults = [];
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

export type Deploy = (ctx: DeploymentContext) => Promise<Outputs> | Promise<void> | Outputs | void;

export interface DelgateDeploymentState extends DeploymentState {
    run: Deploy;
}

export interface DelegateDeployment extends Deployment {
    run: Deploy;
}

export interface DeploymentEventResult extends Record<string | symbol, unknown> {
    status: PipelineStatus;
    error?: Error;
    results: TaskResult[];
}

export type DeploymentEventHandler = (ctx: DeploymentContext) => Promise<DeploymentEventResult>;

export interface DeploymentDescriptor {
    id: string;
    import?: string;
    description?: string;
    inputs: InputDescriptor[];
    outputs: OutputDescriptor[];
    events: string[];
    run(ctx: DeploymentContext): Promise<Result<Outputs>>;
}

export class DeploymentRegistry extends ProxyMap<DeploymentDescriptor> {
    static fromObject(obj: Record<string, DeploymentDescriptor>): DeploymentRegistry {
        const map = new DeploymentRegistry();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key, value);
        }
        return map;
    }

    register(task: DeploymentDescriptor): void {
        if (this.has(task.id)) {
            throw new Error(`Task ${task.id} already exists`);
        }

        this.set(task.id, task);
    }
}

function flatten(map: DeploymentMap, set: Deployment[]): Result<Deployment[]> {
    const results = new Array<Deployment>();
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

export class DeploymentMap extends OrderedMap<string, Deployment> {
    static fromObject(obj: Record<string, Deployment>): DeploymentMap {
        const map = new DeploymentMap();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key, value);
        }
        return map;
    }

    missingDependencies(): Array<{ task: Deployment; missing: string[] }> {
        const missing = new Array<{ task: Deployment; missing: string[] }>();
        for (const task of this.values()) {
            const missingDeps = task.needs.filter((dep) => !this.has(dep));
            if (missingDeps.length > 0) {
                missing.push({ task, missing: missingDeps });
            }
        }
        return missing;
    }

    flatten(targets?: Deployment[]): Result<Deployment[]> {
        targets = targets ?? Array.from(this.values());
        return flatten(this, targets);
    }

    findCyclycalReferences(): Deployment[] {
        const stack = new Set<Deployment>();
        const cycles = new Array<Deployment>();
        const resolve = (task: Deployment) => {
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
