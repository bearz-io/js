import { Inputs, Outputs, StringMap } from "@rex/primitives/collections";
import { REX_DEPLOYMENT_REGISTRY, REX_DEPLOYMENTS } from "./globals.ts";
import { output, REX_TASKS, type Task, TaskMap, toError } from "@rex/tasks";
import type {
    DelegateDeployment,
    Deploy,
    Deployment,
    DeploymentContext,
    DeploymentMap,
} from "./primitives.ts";
import { fail, ok, type Result } from "@bearz/functional";

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
        fn: (
            map: TaskMap,
            add: (id: string) => void,
            get: (id: string) => Task | undefined,
        ) => void,
    ): this {
        return this.tasks("before:deploy", fn);
    }

    after(
        fn: (
            map: TaskMap,
            add: (id: string) => void,
            get: (id: string) => Task | undefined,
        ) => void,
    ): this {
        return this.tasks("after:deploy", fn);
    }

    tasks(
        event: string,
        fn: (
            map: TaskMap,
            add: (id: string) => void,
            get: (id: string) => Task | undefined,
        ) => void,
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

        fn(map, add, get);

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
export function deploy(): DeploymentBuilder {
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
    events: ["before:deploy", "after:deploy"],
    run: async (ctx: DeploymentContext): Promise<Result<Outputs>> => {
        const task = ctx.deployment as DelegateDeployment;
        if (task.run === undefined) {
            return fail(new Error(`Task ${task.id} has no run function`));
        }

        try {
            if (ctx.events["before:deploy"]) {
                const handler = ctx.events["before:deploy"];
                const r = await handler(ctx);
                if (r.error || r.status === "failure" || r.status === "cancelled") {
                    return fail(r.error ?? new Error("Deployment failed from before:deploy tasks"));
                }
            }

            const res = task.run(ctx);
            if (ctx.events["after:deploy"]) {
                const handler = ctx.events["after:deploy"];
                const r = await handler(ctx);
                if (r.error || r.status === "failure" || r.status === "cancelled") {
                    return fail(r.error ?? new Error("Deployment failed from after:deploy tasks"));
                }
            }
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
