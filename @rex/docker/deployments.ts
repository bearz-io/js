import {
    type Deployment,
    DeploymentBuilder,
    type DeploymentContext,
    type DeploymentDef,
    type DeploymentMap,
    REX_DEPLOYMENT_REGISTRY,
} from "@rex/deployments";
import { type Inputs, Outputs } from "@rex/primitives";
import { fail, ok, type Result } from "@bearz/functional";
import { down as execDown, type DownArgs } from "./compose/down.ts";
import { up as execUp, type UpArgs } from "./compose/up.ts";
import { env } from "@bearz/env";

export interface DeployComposeInputs extends Record<string, unknown> {
    files: string[];
    envFiles?: string[];
    projectDirectory?: string;
    projectName?: string;
    profile?: string[];
    context?: string;
}

export interface ComposeDeployment extends Deployment {
    inputs?: DeployComposeInputs;
}

export interface ComposeDeploymentDef extends DeploymentDef {
    with?: DeployComposeInputs | ((ctx: DeploymentContext) => Inputs | Promise<Inputs>);
}

export class ComposeDeploymentBuilder extends DeploymentBuilder {
    constructor(deployment: ComposeDeployment, map?: DeploymentMap) {
        super(deployment, map);

        if (deployment.inputs) {
            this.with(deployment.inputs);
        }
    }
}

export function deployCompose(
    def: ComposeDeploymentDef,
    map?: DeploymentMap,
): ComposeDeploymentBuilder;
export function deployCompose(
    id: string,
    inputs: DeployComposeInputs,
    map?: DeploymentMap,
): ComposeDeploymentBuilder;
export function deployCompose(
    id: string,
    needs: string[],
    inputs: DeployComposeInputs,
    map?: DeploymentMap,
): ComposeDeploymentBuilder;
export function deployCompose(): ComposeDeploymentBuilder {
    if (arguments.length < 2 && typeof arguments[0] === "object") {
        const def = arguments[0] as ComposeDeploymentDef;

        const deployment: ComposeDeployment = {
            id: def.id,
            uses: "@rex/deploy-compose",
            needs: def.needs ?? [],
            cwd: def.cwd,
            description: def.description,
            env: def.env,
            force: def.force,
            if: def.if,
            timeout: def.timeout,
            hooks: {
                "before:deploy": [],
                "after:deploy": [],
                "before:rollback": [],
                "after:rollback": [],
                "before:destroy": [],
                "after:destroy": [],
            },
            name: def.name ?? def.id,
        };

        if (def.with) {
            if (typeof def.with === "function") {
                deployment.with = def.with;
            } else {
                deployment.inputs = def.with;
            }
        }

        const builder = new ComposeDeploymentBuilder(deployment, arguments[1]);

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

        return builder;
    }

    const id = arguments[0] as string;
    const second = arguments[1];
    if (Array.isArray(second)) {
        const needs = second as string[];
        const inputs = arguments[2] as DeployComposeInputs;
        return new ComposeDeploymentBuilder({
            id,
            uses: "@rex/deploy-compose",
            needs,
            inputs,
            hooks: {
                "before:deploy": [],
                "after:deploy": [],
                "before:rollback": [],
                "after:rollback": [],
                "before:destroy": [],
                "after:destroy": [],
            },
        }, arguments[3]);
    }

    const inputs = second as DeployComposeInputs;
    return new ComposeDeploymentBuilder({
        id,
        uses: "@rex/deploy-compose",
        inputs,
        needs: [],
        hooks: {
            "before:deploy": [],
            "after:deploy": [],
            "before:rollback": [],
            "after:rollback": [],
            "before:destroy": [],
            "after:destroy": [],
        },
    }, arguments[2]);
}

REX_DEPLOYMENT_REGISTRY.set("@rex/deploy-compose", {
    id: "@rex/deploy-compose",
    description: "A deployment task using inline code",
    inputs: [{
        "name": "files",
        "type": "array",
        "required": true,
        "description": "The docker-compose files to deploy",
    }, {
        name: "envFiles",
        type: "array",
        required: false,
    }, {
        name: "projectDirectory",
        type: "string",
        required: false,
    }, {
        name: "projectName",
        type: "string",
        required: false,
    }, {
        name: "profile",
        type: "array",
        required: false,
    }, {
        name: "context",
        type: "string",
        required: false,
    }],
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
        const directive = ctx.directive;

        ctx.env.set("REX_CONTEXT", ctx.environmentName);

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

                    const inputs = ctx.state.inputs;
                    if (!inputs) {
                        return fail(new Error("No inputs provided"));
                    }

                    const g: (key: string) => string | undefined = (key) => {
                        if (ctx.state.env.get(key)) {
                            return ctx.state.env.get(key);
                        }

                        if (ctx.env.get(key)) {
                            return ctx.env.get(key);
                        }

                        return env.get(key);
                    };

                    let files = inputs.get("files") as string[] ?? [];
                    let temp = new Array<string>();
                    for (let file of files) {
                        if (file.includes("$")) {
                            file = env.expand(file, { get: g });
                        }

                        temp.push(file);
                    }

                    files = temp;
                    let envFiles = inputs.get("envFiles") as string[] ?? undefined;
                    temp = [];
                    if (envFiles) {
                        for (let file of envFiles) {
                            if (file.includes("$")) {
                                file = env.expand(file, { get: g });
                            }

                            temp.push(file);
                        }

                        envFiles = temp;
                    }

                    let projectDirectory = inputs.get("projectDirectory") as string | undefined;
                    let projectName = inputs.get("projectName") as string | undefined;
                    let profile = inputs.get("profile") as string[] | undefined;
                    let context = inputs.get("context") as string | undefined;

                    if (projectDirectory && projectDirectory.includes("$")) {
                        projectDirectory = env.expand(projectDirectory, { get: g });
                    }

                    if (projectName && projectName.includes("$")) {
                        projectName = env.expand(projectName, { get: g });
                    }

                    if (context && context.includes("$")) {
                        context = env.expand(context, { get: g });
                    }

                    if (profile) {
                        temp = new Array<string>();
                        for (let p of profile) {
                            if (p.includes("$")) {
                                p = env.expand(p, { get: g });
                            }

                            temp.push(p);
                        }

                        profile = temp;
                    }

                    const downArgs: DownArgs = {
                        file: files,
                        envFile: envFiles,
                        projectDirectory,
                        projectName,
                        profile,
                        context,
                    };

                    const r = await execDown(downArgs, {
                        cwd: ctx.state.cwd,
                        env: ctx.state.env.toObject(),
                        signal: ctx.signal,
                    }).run();

                    if (r.code !== 0) {
                        return fail(
                            new Error(
                                `Compose down failed. code: ${r.code} message: ${r.errorText()}`,
                            ),
                        );
                    }

                    const o = new Outputs();
                    o.set("files", downArgs.files);
                    o.set("envFiles", downArgs.envFiles);

                    if (ctx.events["after:destroy"]) {
                        const handler = ctx.events["after:destroy"];
                        const r = await handler(ctx);
                        if (r.error || r.status === "failure" || r.status === "cancelled") {
                            return fail(
                                r.error ?? new Error("Destroy failed from after:destroy tasks"),
                            );
                        }
                    }

                    return ok(o);
                } catch (e) {
                    if (e instanceof Error) {
                        return fail(e);
                    }

                    return fail(new Error(`Unexpected error: ${e}`));
                }

            case "rollback":
                return fail(new Error("Rollback not currently supported"));
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

                    const inputs = ctx.state.inputs;
                    if (!inputs) {
                        return fail(new Error("No inputs provided"));
                    }

                    const g: (key: string) => string | undefined = (key) => {
                        if (ctx.state.env.get(key)) {
                            return ctx.state.env.get(key);
                        }

                        if (ctx.env.get(key)) {
                            return ctx.env.get(key);
                        }

                        return env.get(key);
                    };

                    let files = inputs.get("files") as string[] ?? [];
                    let temp = new Array<string>();
                    for (let file of files) {
                        if (file.includes("$")) {
                            file = env.expand(file, { get: g });
                        }

                        temp.push(file);
                    }

                    files = temp;
                    let envFiles = inputs.get("envFiles") as string[] ?? undefined;
                    temp = [];
                    if (envFiles) {
                        for (let file of envFiles) {
                            if (file.includes("$")) {
                                file = env.expand(file, { get: g });
                            }

                            temp.push(file);
                        }

                        envFiles = temp;
                    }

                    let projectDirectory = inputs.get("projectDirectory") as string | undefined;
                    let projectName = inputs.get("projectName") as string | undefined;
                    let profile = inputs.get("profile") as string[] | undefined;
                    let context = inputs.get("context") as string | undefined;

                    if (projectDirectory && projectDirectory.includes("$")) {
                        projectDirectory = env.expand(projectDirectory, { get: g });
                    }

                    if (projectName && projectName.includes("$")) {
                        projectName = env.expand(projectName, { get: g });
                    }

                    if (context && context.includes("$")) {
                        context = env.expand(context, { get: g });
                    }

                    if (profile) {
                        temp = new Array<string>();
                        for (let p of profile) {
                            if (p.includes("$")) {
                                p = env.expand(p, { get: g });
                            }

                            temp.push(p);
                        }

                        profile = temp;
                    }

                    const upArgs: UpArgs = {
                        file: files,
                        envFile: envFiles,
                        projectDirectory,
                        projectName,
                        profile,
                        context,
                        detach: true,
                    };

                    const r = await execUp(upArgs, {
                        cwd: ctx.state.cwd,
                        env: ctx.state.env.toObject(),
                        signal: ctx.signal,
                    }).run();

                    if (r.code !== 0) {
                        return fail(
                            new Error(
                                `Compose up failed. code: ${r.code} message: ${r.errorText()}`,
                            ),
                        );
                    }

                    const o = new Outputs();
                    o.set("files", upArgs.files);
                    o.set("envFiles", upArgs.envFiles);

                    if (ctx.events["after:deploy"]) {
                        const handler = ctx.events["after:deploy"];
                        const r = await handler(ctx);
                        if (r.error || r.status === "failure" || r.status === "cancelled") {
                            return fail(
                                r.error ?? new Error("Deployment failed from after:deploy tasks"),
                            );
                        }
                    }

                    return ok(o);
                } catch (e) {
                    if (e instanceof Error) {
                        return fail(e);
                    }

                    return fail(new Error(`Unexpected error: ${e}`));
                }
        }
    },
});
