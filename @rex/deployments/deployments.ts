import { Inputs, Outputs, StringMap } from "@rex/primitives/collections";
import { rexDeploymentHandlerRegistry, rexDeployments } from "./globals.ts";
import {
    type AddTaskDelegate,
    rexTasks,
    type RunDelegate,
    task as defineTask,
    type TaskBuilder,
    TaskMap,
    toError,
} from "@rex/tasks";
import type {
    DelegateDeployment,
    Deploy,
    Deployment,
    DeploymentContext,
    DeploymentDef,
    DeploymentMap,
} from "./types.ts";
import { fail, ok, type Result } from "@bearz/functional";

/**
 * The delegate deployment definition.
 */
export interface DelegateDeploymentDef extends DeploymentDef {
    /**
     * The unique identifier of the deployment.
     */
    id: string;
    /**
     * The deployment function.
     */
    run: Deploy;
    /**
     * The rollback function for the deployment.
     */
    rollback?: Deploy;
    /**
     * The destroy function for the deployment.
     */
    destroy?: Deploy;
}

/**
 * A monadic builder for creating deployments.
 */
export class DeploymentBuilder {
    #deployment: Deployment;

    /**
     * Creates a new deployment builder.
     * @param deployment The deployment to build.
     * @param map The deployment collection to add the deployment to.
     */
    constructor(deployment: Deployment, map?: DeploymentMap) {
        this.#deployment = deployment;
        map ??= rexDeployments();
        map.set(deployment.id, deployment);
    }

    /**
     * Sets the current working directory for the deployment.
     * @param cwd The current working directory as a string or a function that returns a string.
     * @returns The instance of the deployment builder for method chaining.
     */
    cwd(cwd: string | ((ctx: DeploymentContext) => string | Promise<string>)): this {
        this.#deployment.cwd = cwd;
        return this;
    }

    /**
     * Sets the description of the deployment.
     * @param description The description of the deployment.
     * @returns The instance of the deployment builder for method chaining.
     */
    description(description: string): this {
        this.#deployment.description = description;
        return this;
    }

    /**
     * Sets the task to run before the deployment.
     * @param fn The function to add tasks to the deployment before event.
     * @returns The instance of the deployment builder for method chaining.
     */
    before(
        fn: AddTaskDelegate,
    ): this {
        return this.tasks("before:deploy", fn);
    }

    /**
     * Sets the tasks to run after the deployment.
     * @param fn The function to add tasks to the deployment after event.
     * @returns The instance of the deployment builder for method chaining.
     */
    after(
        fn: AddTaskDelegate,
    ): this {
        return this.tasks("after:deploy", fn);
    }

    /**
     * Sets the tasks to run before the rollback.
     * @param fn The function to add tasks to the deployment before:rollback event.
     * @returns The instance of the deployment builder for method chaining.
     */
    beforeRollback(
        fn: AddTaskDelegate,
    ): this {
        return this.tasks("before:rollback", fn);
    }

    /**
     * Sets the tasks to run after the rollback.
     * @param fn The function to add tasks to the deployment after:rollback event.
     * @returns The instance of the deployment builder for method chaining.
     */
    afterRollback(
        fn: AddTaskDelegate,
    ): this {
        return this.tasks("after:rollback", fn);
    }

    /**
     * Sets the tasks to run before the destroy.
     * @param fn The function to add tasks to the deployment before:destroy event.
     * @returns The instance of the deployment builder for method chaining.
     */
    beforeDestroy(
        fn: AddTaskDelegate,
    ): this {
        return this.tasks("before:destroy", fn);
    }

    /**
     * Sets the tasks to run after the destroy.
     * @param fn The function to add tasks to the deployment after:destroy event.
     * @returns The instance of the deployment builder for method chaining.
     */
    afterDestroy(
        fn: AddTaskDelegate,
    ): this {
        return this.tasks("after:destroy", fn);
    }

    /**
     * Sets the rollback function for the deployment.
     * @param fn The rollback function for the deployment.
     * @returns The instance of the deployment builder for method chaining.
     */
    rollback(fn: Deploy): this {
        this.#deployment.rollback = fn;
        return this;
    }

    /**
     * Sets the destroy function for the deployment.
     * @param fn The destroy function for the deployment.
     * @returns The instance of the deployment builder for method chaining.
     */
    destroy(fn: Deploy): this {
        this.#deployment.destroy = fn;
        return this;
    }

    /**
     * Sets the tasks to run for a specific event.
     * @param event The event to add tasks to.
     * @param fn The function to add tasks to the event.
     * @returns The instance of the deployment builder for method chaining.
     */
    tasks(
        event: string,
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

        this.#deployment.hooks[event] = map.values().toArray();

        return this;
    }

    /**
     * Sets the environment variables for the deployment.
     * @param env The environment variables for the deployment.
     * @returns The instance of the deployment builder for method chaining.
     */
    env(
        env:
            | Record<string, string>
            | StringMap
            | ((ctx: DeploymentContext) => StringMap | Promise<StringMap>),
    ): this {
        if (env instanceof StringMap) {
            this.#deployment.env = env;
            return this;
        }

        if (typeof env === "function") {
            this.#deployment.env = env;
            return this;
        }

        this.#deployment.env = new StringMap();
        this.#deployment.env.merge(env);
        return this;
    }

    /**
     * Sets the force option for the deployment.
     * @param force The force option for the deployment.
     * @returns The instance of the deployment builder for method chaining.
     */
    force(force: boolean | ((ctx: DeploymentContext) => boolean | Promise<boolean>)): this {
        this.#deployment.force = force;
        return this;
    }

    /**
     * Sets the if condition for the deployment.
     * @param condition The if condition for the deployment.
     * @returns The instance of the deployment builder for method chaining.
     */
    if(condition: boolean | ((ctx: DeploymentContext) => boolean | Promise<boolean>)): this {
        this.#deployment.if = condition;
        return this;
    }

    /**
     * Sets the timeout for the deployment.
     * @param timeout The timeout in seconds or a function that takes.
     * @returns The instance of the deployment builder for method chaining.
     */
    timeout(timeout: number | ((ctx: DeploymentContext) => number | Promise<number>)): this {
        this.#deployment.timeout = timeout;
        return this;
    }

    /**
     * Sets the inputs for the deployment.
     * @param inputs The inputs for the deployment.
     * @returns The instance of the deployment builder for method chaining.
     */
    with(
        inputs:
            | Record<string, unknown>
            | Inputs
            | ((ctx: DeploymentContext) => Inputs | Promise<Inputs>),
    ): this {
        if (inputs instanceof Inputs) {
            this.#deployment.with = inputs;
            return this;
        }

        if (typeof inputs === "function") {
            this.#deployment.with = inputs;
            return this;
        }

        this.#deployment.with = new Inputs();
        this.#deployment.with.merge(inputs);
        return this;
    }

    /**
     * Sets the name of the deployment.
     * @param name The name of the deployment.
     * @returns The instance of the deployment builder for method chaining.
     */
    name(name: string): this {
        this.#deployment.name = name;
        return this;
    }

    /**
     * Sets the dependencies for the deployment.
     * @param needs The dependencies for the deployment.
     * @returns The instance of the deployment builder for method chaining.
     */
    needs(...needs: string[]): this {
        this.#deployment.needs = needs;
        return this;
    }

    /**
     * Builds the deployment.
     * @returns The deployment.
     */
    build(): Deployment {
        return this.#deployment;
    }
}

/**
 * Creates a new deployment.
 * @param id The unique identifier of the deployment.
 * @param fn The deployment function.
 * @param map The deployment map to add the deployment to.
 * @returns The deployment builder.
 * ```ts
 * import { deploy } from "@rex/deployments";
 * import { cmd } from "@bearz/exec"
 *
 * deploy("my-deployment", async (ctx) => {
 *    // deployment code
 *    await cmd("az", ["group", "create", "--name", "my-resource-group", "--location", "eastus"]);
 * });
 * ```
 */
export function deploy(id: string, fn: Deploy, map?: DeploymentMap): DeploymentBuilder;
/**
 * Creates a new deployment.
 * @param id The unique identifier of the deployment.
 * @param needs The dependencies for the deployment.
 * @param fn The deployment function.
 * @param map The deployment map to add the deployment to.
 * @returns The deployment builder.
 * ```ts
 * import { deploy } from "@rex/deployments";
 * import { cmd } from "@bearz/exec"
 *
 * deploy("my-other-deployment", async (ctx) => {
 *      // deployment code
 * });
 *
 * deploy("my-deployment", ["my-other-deployment"], async (ctx) => {
 *   // deployment code
 * });
 * ```
 */
export function deploy(
    id: string,
    needs: string[],
    fn: Deploy,
    map?: DeploymentMap,
): DeploymentBuilder;
/**
 * Creates a new deployment.
 * @param def The deployment definition.
 * @returns The deployment builder.
 * ```ts
 * import { deploy } from "@rex/deployments";
 * import { cmd } from "@bearz/exec"
 *
 * deploy({
 *    id: "my-deployment",
 *    run: async (ctx) => {
 *      // deployment code
 *      await cmd("az", ["group", "create", "--name", "my-resource-group", "--location", "eastus"]);
 *    }
 * });
 * ```
 */
export function deploy(def: DelegateDeploymentDef): DeploymentBuilder;
export function deploy(): DeploymentBuilder {
    const uses = "@rex/delegate-deployment";

    if (arguments.length === 1 && typeof arguments[0] === "object") {
        const def = arguments[0] as DelegateDeploymentDef;
        const task: DelegateDeployment = {
            id: def.id,
            uses,
            name: def.name ?? def.id,
            needs: def.needs ?? [],
            run: def.run,
            rollback: def.rollback,
            destroy: def.destroy,
            hooks: {},
        };

        const builder = new DeploymentBuilder(task);
        if (def.before) {
            builder.before(def.before);
        }

        if (def.after) {
            builder.after(def.after);
        }

        if (def.beforeRollback) {
            builder.beforeRollback(def.beforeRollback);
        }

        if (def.afterRollback) {
            builder.afterRollback(def.afterRollback);
        }

        if (def.beforeDestroy) {
            builder.beforeDestroy(def.beforeDestroy);
        }

        if (def.afterDestroy) {
            builder.afterDestroy(def.afterDestroy);
        }

        if (def.cwd) {
            builder.cwd(def.cwd);
        }

        if (def.env) {
            builder.env(def.env);
        }

        if (def.force) {
            builder.force(def.force);
        }

        if (def.if) {
            builder.if(def.if);
        }

        if (def.timeout) {
            builder.timeout(def.timeout);
        }

        if (def.name) {
            builder.name(def.name);
        }

        if (def.needs) {
            builder.needs(...def.needs);
        }

        return builder;
    }

    const id = arguments[0];
    let fn = arguments[1];
    let tasks: DeploymentMap | undefined = undefined;
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

    const task: DelegateDeployment = {
        id: id,
        uses,
        name: id,
        needs: needs,
        run: fn,
        hooks: {},
    };

    return new DeploymentBuilder(task, tasks);
}

/**
 * Common events for deployments. Do not edit this array.
 */
export const CommonEvents: string[] = [
    "before:deploy",
    "after:deploy",
    "before:rollback",
    "after:rollback",
    "before:destroy",
    "after:destroy",
];

const taskRegistry = rexDeploymentHandlerRegistry();
taskRegistry.set("@rex/delegate-deployment", {
    id: "@rex/delegate-deployment",
    description: "A deployment task using inline code",
    inputs: [],
    outputs: [],
    events: CommonEvents,
    run: async (ctx: DeploymentContext): Promise<Result<Outputs>> => {
        const task = ctx.deployment as DelegateDeployment;
        const directive = ctx.directive;

        if (task.rollback === undefined) {
            task.rollback = () => {
                console.warn(`Task ${task.id} has no rollback function`);
            };
        }

        if (task.destroy === undefined) {
            task.destroy = () => {
                console.warn(`Task ${task.id} has no destroy function`);
            };
        }

        if (task.run === undefined) {
            return fail(new Error(`Task ${task.id} has no run function`));
        }

        switch (directive) {
            case "destroy":
                try {
                    if (ctx.events["before:destroy"]) {
                        const handler = ctx.events["before:destroy"];
                        const r = await handler(ctx);
                        if (r.error || r.status === "failure" || r.status === "cancelled") {
                            return fail(
                                r.error ?? new Error("Destroy failed from before:destroy tasks"),
                            );
                        }
                    }

                    let res = task.destroy(ctx);
                    if (res instanceof Promise) {
                        res = await res;
                    }

                    if (ctx.events["after:destroy"]) {
                        const handler = ctx.events["after:destroy"];
                        const r = await handler(ctx);
                        if (r.error || r.status === "failure" || r.status === "cancelled") {
                            return fail(
                                r.error ?? new Error("Destroy failed from after:destroy tasks"),
                            );
                        }
                    }

                    if (res instanceof Outputs) {
                        return ok(res);
                    }

                    return ok(new Outputs());
                } catch (e) {
                    return fail(toError(e));
                }

            case "rollback":
                try {
                    if (ctx.events["before:rollback"]) {
                        const handler = ctx.events["before:rollback"];
                        const r = await handler(ctx);
                        if (r.error || r.status === "failure" || r.status === "cancelled") {
                            return fail(
                                r.error ?? new Error("Rollback failed from before:rollback tasks"),
                            );
                        }
                    }

                    let res = task.rollback(ctx);
                    if (res instanceof Promise) {
                        res = await res;
                    }

                    if (ctx.events["after:rollback"]) {
                        const handler = ctx.events["after:rollback"];
                        const r = await handler(ctx);
                        if (r.error || r.status === "failure" || r.status === "cancelled") {
                            return fail(
                                r.error ?? new Error("Deployment failed from after:rollback tasks"),
                            );
                        }
                    }

                    if (res instanceof Outputs) {
                        return ok(res);
                    }

                    return ok(new Outputs());
                } catch (e) {
                    return fail(toError(e));
                }
            case "deploy":
            default:
                try {
                    if (ctx.events["before:deploy"]) {
                        const handler = ctx.events["before:deploy"];
                        const r = await handler(ctx);
                        if (r.error || r.status === "failure" || r.status === "cancelled") {
                            return fail(
                                r.error ?? new Error("Deployment failed from before:deploy tasks"),
                            );
                        }
                    }

                    let res = task.run(ctx);
                    if (res instanceof Promise) {
                        res = await res;
                    }
                    if (ctx.events["after:deploy"]) {
                        const handler = ctx.events["after:deploy"];
                        const r = await handler(ctx);
                        if (r.error || r.status === "failure" || r.status === "cancelled") {
                            return fail(
                                r.error ?? new Error("Deployment failed from after:deploy tasks"),
                            );
                        }
                    }

                    if (res instanceof Outputs) {
                        return ok(res);
                    }

                    return ok(new Outputs());
                } catch (e) {
                    return fail(toError(e));
                }
        }
    },
});
