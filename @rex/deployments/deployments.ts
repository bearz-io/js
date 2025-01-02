import { Inputs, Outputs, StringMap } from "@rex/primitives/collections";
import { REX_DEPLOYMENT_REGISTRY, REX_DEPLOYMENTS } from "./globals.ts";
import {
    type AddTaskDelegate,
    output,
    REX_TASKS,
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
} from "./primitives.ts";
import { fail, ok, type Result } from "@bearz/functional";

export interface DelegateDeploymentDef extends DeploymentDef {
    run: Deploy;
    rollback?: Deploy;
    destroy?: Deploy;
}

export class DeploymentBuilder {
    #deployment: Deployment;

    constructor(deployment: Deployment, map?: DeploymentMap) {
        this.#deployment = deployment;
        map ??= REX_DEPLOYMENTS;
        map.set(deployment.id, deployment);
    }

    cwd(cwd: string | ((ctx: DeploymentContext) => string | Promise<string>)): this {
        this.#deployment.cwd = cwd;
        return this;
    }

    description(description: string): this {
        this.#deployment.description = description;
        return this;
    }

    before(
        fn: AddTaskDelegate,
    ): this {
        return this.tasks("before:deploy", fn);
    }

    after(
        fn: AddTaskDelegate,
    ): this {
        return this.tasks("after:deploy", fn);
    }

    beforeRollback(
        fn: AddTaskDelegate,
    ): this {
        return this.tasks("before:rollback", fn);
    }

    afterRollback(
        fn: AddTaskDelegate,
    ): this {
        return this.tasks("after:rollback", fn);
    }

    beforeDestroy(
        fn: AddTaskDelegate,
    ): this {
        return this.tasks("before:destroy", fn);
    }

    afterDestroy(
        fn: AddTaskDelegate,
    ): this {
        return this.tasks("after:destroy", fn);
    }

    rollback(fn: Deploy): this {
        this.#deployment.rollback = fn;
        return this;
    }

    destroy(fn: Deploy): this {
        this.#deployment.destroy = fn;
        return this;
    }

    tasks(
        event: string,
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

        this.#deployment.hooks[event] = map.values().toArray();

        return this;
    }

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

    force(force: boolean | ((ctx: DeploymentContext) => boolean | Promise<boolean>)): this {
        this.#deployment.force = force;
        return this;
    }

    if(condition: boolean | ((ctx: DeploymentContext) => boolean | Promise<boolean>)): this {
        this.#deployment.if = condition;
        return this;
    }

    timeout(timeout: number | ((ctx: DeploymentContext) => number | Promise<number>)): this {
        this.#deployment.timeout = timeout;
        return this;
    }

    with(
        inputs:
            | Record<string, unknown>
            | Inputs
            | ((ctx: DeploymentContext) => Inputs | Promise<Inputs>),
    ): this {
        console.log("setting inputs", inputs);
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

    name(name: string): this {
        this.#deployment.name = name;
        return this;
    }

    needs(...needs: string[]): this {
        this.#deployment.needs = needs;
        return this;
    }

    build(): Deployment {
        return this.#deployment;
    }
}

export function deploy(
    id: string,
    needs: string[],
    rn: Deploy,
    map?: DeploymentMap,
): DeploymentBuilder;
export function deploy(id: string, fn: Deploy, map?: DeploymentMap): DeploymentBuilder;
export function deploy(def: DelegateDeploymentDef): DeploymentBuilder;
export function deploy(): DeploymentBuilder {
    if (arguments.length === 1 && typeof arguments[0] === "object") {
        const def = arguments[0] as DelegateDeploymentDef;
        const task: DelegateDeployment = {
            id: def.id,
            uses: "delegate-deployment",
            name: def.name ?? def.id,
            needs: def.needs ?? [],
            run: def.run,
            rollback: def.rollback,
            destroy: def.destroy,
            hooks: {
                "before:deploy": [],
                "after:deploy": [],
                "before:rollback": [],
                "after:rollback": [],
                "before:destroy": [],
                "after:destroy": [],
            },
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
        uses: "delegate-deployment",
        name: id,
        needs: needs,
        run: fn,
        hooks: {
            "before:deploy": [],
            "after:deploy": [],
            "before:rollback": [],
            "after:rollback": [],
            "before:destroy": [],
            "after:destroy": [],
        },
    };

    return new DeploymentBuilder(task, tasks);
}

const taskRegistry = REX_DEPLOYMENT_REGISTRY;
taskRegistry.set("delegate-deployment", {
    id: "delegate-deployment",
    description: "A deployment task using inline code",
    inputs: [],
    outputs: [],
    events: [
        "before:deploy",
        "after:deploy",
        "before:rollback",
        "after:rollback",
        "before:destroy",
        "after:destroy",
    ],
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

                    return ok(output({}));
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

                    return ok(output({}));
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

                    return ok(output({}));
                } catch (e) {
                    return fail(toError(e));
                }
        }
    },
});
