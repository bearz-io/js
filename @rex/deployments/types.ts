// TODO: Write module code here

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
import type { AddTaskDelegate, PipelineStatus, Task, TaskResult, TaskState } from "@rex/tasks";

/**
 * The names of the deployment hooks.
 */
export type DeploymentHookNames =
    | "before:deploy"
    | "after:deploy"
    | "before:rollback"
    | "after:rollback"
    | "before:destroy"
    | "after:destroy"
    | string;

/**
 * The deployment hooks which is a object map of tasks.
 */
export type DeploymentHooks = Record<DeploymentHookNames, Task[] | undefined>;

/**
 * The deployment.
 */
export interface Deployment extends Lookup {
    /**
     * The unique identifier of the deployment.
     */
    id: string;

    /**
     * The name of the deployment. Defaults to the id.
     * This name is used in the UI.
     */
    name?: string;

    /**
     * The description of the deployment.
     */
    uses: string;

    /**
     * The description of the deployment.
     */
    description?: string;

    /**
     * The inputs of the deployment.
     */
    with?: Inputs | ((ctx: DeploymentContext) => Inputs | Promise<Inputs>);

    /**
     * The environment variables to set before running the deployment.
     */
    env?: StringMap | ((ctx: DeploymentContext) => StringMap | Promise<StringMap>);

    /**
     * The working directory to run the deployment in.
     */
    cwd?: string | ((ctx: DeploymentContext) => string | Promise<string>);

    /**
     * The timeout for the deployment in seconds.
     */
    timeout?: number | ((ctx: DeploymentContext) => number | Promise<number>);

    /**
     * A condition that must be true for the deployment to run.
     */
    if?: boolean | ((ctx: DeploymentContext) => boolean | Promise<boolean>);

    /**
     * Forces the deployment to run even if the previous deployment has failed.
     */
    force?: boolean | ((ctx: DeploymentContext) => boolean | Promise<boolean>);

    /**
     * The the other deployments that this deployment depends on.
     */
    needs?: string[];

    /** */
    hooks: DeploymentHooks;
}

export interface DeploymentState extends TaskState {
    uses: string;

    /**
     * The other services that this service
     * depends on, which are run before this service.
     */
    needs: string[];
}

export interface DeploymentContext extends ExecutionContext {
    /**
     * The deployment state which contains all resolved values.
     */
    state: DeploymentState;
    /**
     * The available events for the deployment.
     */
    events: Record<string | symbol, DeploymentEventHandler>;
    /**
     * The deployment directive which are: `deploy`, `rollback`, or `destroy`.
     */
    directive: "deploy" | "rollback" | "destroy";
    /**
     * The environment name which is passed in by the cli as the context switch.
     */
    environmentName: "development" | "staging" | "production" | "test" | "default" | string;
    /**
     * The arguments passed in from the cli.
     */
    args?: string[];
}

/**
 * A deployment definition.
 */
export interface DeploymentDef extends Lookup {
    /**
     * The name of the deployment. Defaults to the id.
     * This name is used in the UI.
     */
    name?: string;
    /**
     * The description of the deployment which is displayed in the cli.
     */
    description?: string;
    /**
     * Tasks to run before the deployment.
     */
    before?: AddTaskDelegate;
    /**
     * Tasks to run after the deployment.
     */
    after?: AddTaskDelegate;
    /**
     * Tasks to run before the deployment is rolled back.
     */
    beforeRollback?: AddTaskDelegate;
    /**
     * Tasks to run after the deployment is rolled back.
     */
    afterRollback?: AddTaskDelegate;
    /**
     * Tasks to run before the deployment is destroyed.
     */
    beforeDestroy?: AddTaskDelegate;
    /**
     * Tasks to run after the deployment is destroyed.
     */
    afterDestroy?: AddTaskDelegate;
    /**
     * The other deployments that this deployment depends on.
     */
    needs?: string[];
    /**
     * The current working directory used by the deployment.
     */
    cwd?: string | ((ctx: DeploymentContext) => string | Promise<string>);
    /**
     * The environment variables to set before running the deployment.
     */
    env?: StringMap | ((ctx: DeploymentContext) => StringMap | Promise<StringMap>);
    /**
     * The force flag for the deployment, which forces the deployment to run even if the previous deployment has failed.
     */
    force?: boolean | ((ctx: DeploymentContext) => boolean | Promise<boolean>);
    /**
     * The condition that must be true for the deployment to run.
     */
    if?: boolean | ((ctx: DeploymentContext) => boolean | Promise<boolean>);
    /**
     * The timeout for the deployment in seconds.
     */
    timeout?: number | ((ctx: DeploymentContext) => number | Promise<number>);
}

/**
 * The result of a deployment.
 */
export class DeploymentResult {
    /**
     * The outputs of the deployment.
     */
    outputs: Outputs;
    /**
     * The status of the deployment.
     */
    status: PipelineStatus;
    /**
     * The error that occurred during the deployment.
     */
    error?: Error;
    /**
     * The time the deployment started.
     */
    startedAt: Date;
    /**
     * The time the deployment finished.
     */
    finishedAt: Date;
    /**
     * The unique identifier of the deployment.
     */
    id: string;
    /**
     * The results of the tasks that were run.
     */
    taskResults: TaskResult[];

    /**
     * Creates a new deployment result.
     * @param id The unique identifier of the deployment.
     */
    constructor(id: string) {
        this.id = id;
        this.outputs = new Outputs();
        this.status = "success";
        this.error = undefined;
        this.startedAt = new Date();
        this.finishedAt = this.startedAt;
        this.taskResults = [];
    }

    /**
     * Tracks the start time of the deployment.
     * @returns The instance of the deployment result for method chaining.
     */
    start(): this {
        this.startedAt = new Date();
        return this;
    }

    /**
     * Tracks the end time of the deployment.
     * @returns The instance of the deployment result for method chaining.
     */
    stop(): this {
        this.finishedAt = new Date();
        return this;
    }

    /**
     * Sets the status of the deployment to 'failure'.
     * @param err The error that occurred during the deployment.
     * @returns The instance of the deployment result for method chaining.
     */
    fail(err: Error): this {
        this.status = "failure";
        this.error = err;
        return this;
    }

    /**
     * Sets the status of the deployment to 'cancelled'.
     * @returns The instance of the deployment result for method chaining.
     */
    cancel(): this {
        this.status = "cancelled";
        return this;
    }

    /**
     * Sets the status of the deployment to 'skipped'.
     * @returns The instance of the deployment result for method chaining.
     */
    skip(): this {
        this.status = "skipped";
        return this;
    }

    /**
     * Sets the status of the deployment to 'success'.
     * @param outputs The outputs of the deployment.
     * @returns The instance of the deployment result for method chaining.
     */
    success(outputs?: Record<string, unknown>): this {
        if (outputs) {
            this.outputs.merge(outputs);
        }
        return this;
    }
}
/**
 * The deploy delegate.
 */
export type Deploy = (ctx: DeploymentContext) => Promise<Outputs> | Promise<void> | Outputs | void;

/**
 * The delegate deployment state.
 */
export interface DelgateDeploymentState extends DeploymentState {
    /**
     * The delegate function that is executed by the deployment.
     */
    run: Deploy;
}

/**
 * A delegate deployment.
 */
export interface DelegateDeployment extends Deployment {
    run: Deploy;
    rollback?: Deploy;
    destroy?: Deploy;
}

/**
 * The result of a deployment event which are mapped to the deployment events/hooks
 */
export interface DeploymentEventResult extends Record<string | symbol, unknown> {
    /**
     * The status of the deployment event.
     */
    status: PipelineStatus;
    /**
     * The error that occurred during the deployment event.
     */
    error?: Error;
    /**
     * The results of the tasks that were run during the deployment event.
     */
    results: TaskResult[];
}

/**
 * The deployment event handler.
 */
export type DeploymentEventHandler = (ctx: DeploymentContext) => Promise<DeploymentEventResult>;

/**
 * The deployment handler.
 */
export interface DeploymentHandler {
    /**
     * The unique identifier of the deployment.
     */
    id: string;
    /**
     * The import used to load the deployment handler.
     */
    import?: string;
    /**
     * The description of the deployment. This is the default description set
     * to the deployment if no description is provided.
     */
    description?: string;
    /**
     * The inputs of the deployment.
     */
    inputs: InputDescriptor[];
    /**
     * The outputs of the deployment
     */
    outputs: OutputDescriptor[];
    /**
     * The events that the deployment can handle.
     */
    events: string[];
    /**
     * The function that is executed by the deployment.
     */
    run(ctx: DeploymentContext): Promise<Result<Outputs>>;
}

/**
 * The deployment registry which is a map of deployment handlers.
 */
export class DeploymentHandlerRegistry extends ProxyMap<DeploymentHandler> {
    /**
     * Creates a deployment registry from an object.
     * @param obj The object to create the deployment registry from.
     * @returns The deployment registry.
     */
    static fromObject(obj: Record<string, DeploymentHandler>): DeploymentHandlerRegistry {
        const map = new DeploymentHandlerRegistry();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key, value);
        }
        return map;
    }

    /**
     * Registers a deployment handler.
     * @param task The deployment handler to register.
     */
    register(task: DeploymentHandler): void {
        if (this.has(task.id)) {
            throw new Error(`Task ${task.id} already exists`);
        }

        this.set(task.id, task);
    }
}

function flatten(map: DeploymentMap, set: Deployment[]): Result<Deployment[]> {
    const results = new Array<Deployment>();
    for (const deployment of set) {
        if (!deployment) {
            continue;
        }

        const needs = deployment.needs ?? [];

        for (const dep of needs) {
            const depTask = map.get(dep);
            if (!depTask) {
                return fail(new Error(`Task ${deployment.id} depends on missing task ${dep}`));
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

        if (!results.includes(deployment)) {
            results.push(deployment);
        }
    }

    return ok(results);
}

/**
 * A map of deployments.
 */
export class DeploymentMap extends OrderedMap<string, Deployment> {
    /**
     * Creates a deployment map from an object.
     * @param obj The object to create the deployment map from.
     * @returns The deployment map.
     */
    static fromObject(obj: Record<string, Deployment>): DeploymentMap {
        const map = new DeploymentMap();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key, value);
        }
        return map;
    }

    /**
     * Finds any deployments that are missing dependencies.
     * @returns An array of deployments that are missing dependencies.
     */
    missingDependencies(): Array<{ deployment: Deployment; missing: string[] }> {
        const missing = new Array<{ deployment: Deployment; missing: string[] }>();
        for (const deployment of this.values()) {
            if (!deployment.needs) {
                continue;
            }

            const missingDeps = deployment.needs.filter((dep) => !this.has(dep));
            if (missingDeps.length > 0) {
                missing.push({ deployment, missing: missingDeps });
            }
        }
        return missing;
    }

    /**
     * Flattens the deployment map into an array of deployments.
     * @param targets The deployments to flatten. If not provided, all deployments are flattened.
     * @returns The flattened deployments.
     */
    flatten(targets?: Deployment[]): Result<Deployment[]> {
        targets = targets ?? Array.from(this.values());
        return flatten(this, targets);
    }

    /**
     * Finds any deployments that have cyclical references.
     * @returns The deployments that have cyclical references.
     */
    findCyclycalReferences(): Deployment[] {
        const stack = new Set<Deployment>();
        const cycles = new Array<Deployment>();
        const resolve = (task: Deployment) => {
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
