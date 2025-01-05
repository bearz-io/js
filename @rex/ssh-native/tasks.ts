
import {
    getTaskHandlerRegistry,
    type Task,
    TaskBuilder,
    type TaskContext,
    type TaskDef,
    type TaskMap,
    toError,
} from "@rex/tasks";
import { fail, ok, type Result } from "@bearz/functional";
import { type Inputs, Outputs } from "@rex/primitives";
import { env } from "@bearz/env";
import { readTextFile } from "@bearz/fs";
import { cmd } from "@bearz/exec";

/**
 * The parameters for the ssh task.
 */
export interface SshTaskParams extends Record<string | symbol, unknown> {
    /**
     * The user for the ssh connection.
     */
    user: string;
    /**
     * The target host for the ssh connection.
     */
    host: string;
    /**
     * The port to connect to. Defaults to 22.
     */
    port?: number;
    /**
     * The identity file to use for the ssh connection.
     */
    identityFile?: string;
    /**
     * The command to execute. If file is provided, the command will be read from the file.
     * 
     */
    command?: string;
    /**
     * The file to execute. If file is provided, the command will be read from the file.
     */
    file?: string;
    /**
     * Additional arguments to pass to ssh. The arguments are prepended before the 
     * target e.g. `ssh [args] user@host`.
     */
    args?: string[];

    /**
     * If true, the output of the command will be stored as the output of the task
     * as `stdout` and `stderr`.
     */
    captureOutput?: boolean;
}

/**
 * The ssh task.
 * 
 * @see SshTaskParams
 */
export interface SshTask extends Task {
    /**
     * The parameters for the ssh task. This is only use for 
     * code tasks. 
     */
    params?: SshTaskParams;
}

/**
 * The ssh task definition. This is as the input for the task builder
 * and convert into `SshTask`.
 * 
 * @see SshTask
 */
export interface SshTaskDef extends TaskDef {
    id: string;
    with: SshTaskParams | ((ctx: TaskContext) => Inputs | Promise<Inputs>);
}

/**
 * The task builder for the ssh task.
 */
export class SshTaskBuilder extends TaskBuilder {

    /**
     * Creates a new ssh task builder.
     * @param task The task to build.
     * @param map The task map to register the task with. If undefined, the task
     * will be global.
     */
    constructor(task: SshTask, map?: TaskMap) {
        super(task, map);

        if (task.params) {
            this.with(task.params);
        }
    }
}
/**
 * Defines a new ssh task using a task definition. This overload is
 * typically used for complex configuration or dynamic late bound
 * configuration for the `with` property.
 * @param def The task definition.
 * @param map The task map to register the task with.
 * @returns The ssh task builder.
 * 
 * @example 
 * ```typescript
 * import { sshTask } from "@rex/ssh-native";
 * 
 * sshTask({
 *    id: "get-uptime",
 *    with: {
 *       user: "user",
 *       host: "10.0.0.1",
 *       command: "uptime",
 *    }
 * });
 * 
 * sshTask("get-uptime2", {
 *     user: "$USER", // environment variables are expanded
 *     host: "10.0.0.1",
 *     command: "uptime",
 *     identityFile: "~/.ssh/id_rsa",
 * });
 * ```
 */
export function sshTask(def: SshTaskDef, map?: TaskMap): SshTaskBuilder;
/**
 * Defines a new ssh task using a task id and parameters.
 * @param id The id of the task.
 * @param params The parameters for the ssh task.
 * @param map The task map to register the task with. Defaults to the global task registry.
 * 
 * @example
 * ```typescript
 * // rexfile.ts
 * import { sshTask } from "@rex/ssh-native";
 * 
 * sshTask("get-uptime", {
 *     user: "user",
 *     host: "10.0.0.1",
 *     command: "uptime",
 *     identityFile: "~/.ssh/id_rsa",
 * });
 * 
 * sshTask("get-uptime2", {
 *     user: "$USER", // environment variables are expanded
 *     host: "10.0.0.1",
 *     command: "uptime",
 *     identityFile: "~/.ssh/id_rsa",
 * });
 * ```
 */
export function sshTask(id: string, params: SshTaskParams, map?: TaskMap): SshTaskBuilder;
/**
 * Defines a new ssh task using a task id and parameters.
 * @param id The id of the task.
 * @param params The parameters for the ssh task.
 * @param needs The dependent tasks to run before this task is run.
 * @param map The task map to register the task with. Defaults to the global task registry.
 * 
 * @example
 * ```typescript
 * // rexfile.ts
 * import { sshTask } from "@rex/ssh-native";
 * 
 * sshTask("get-uptime", {
 *     user: "user",
 *     host: "10.0.0.1",
 *     command: "uptime",
 *     identityFile: "~/.ssh/id_rsa",
 * }, ["install"]);
 * ```
 */
export function sshTask(
    id: string | SshTaskParams | SshTaskDef,
    params: SshTaskParams,
    needs: string[] | TaskMap,
    map?: TaskMap,
): SshTaskBuilder 
export function sshTask() : SshTaskBuilder {
    
    const first = arguments[0];
    const second = arguments[1];
    const uses = "@rex/ssh-native/ssh";

    if (typeof first === 'object') {
        const def = first as SshTaskDef;
        const task : SshTask = {
            id: def.id,
            uses,
            cwd: def.cwd,
            force: def.force,
            if: def.if,
            timeout: def.timeout,
            description: def.description,
            needs: def.needs ?? [],
            name: def.name ?? def.id,
        }

        if (typeof def.with === 'function') {
            task.with = def.with;
        } else {
            task.params = def.with;
        }

        return new SshTaskBuilder(task, arguments[1]);
    }

    const id = first as string;
    const params = second as SshTaskParams;
    const third = arguments[2];
    if (Array.isArray(third)) {
        const needs = third as string[];
        return new SshTaskBuilder({
            id,
            uses,
            needs,
            params,
        }, arguments[3]);
    }

    return new SshTaskBuilder({
        id,
        uses,
        params,
        needs: [],
    }, arguments[2]);
}

const taskHandlerRegistery = getTaskHandlerRegistry();

taskHandlerRegistery.set("@rex/ssh-native/ssh", {
    id: "@rex/ssh-native/ssh",
    inputs: [{
        name: "user",
        type: "string",
        required: true,
        "description": "The user to connect as"
    }, {
        name: "host",
        type: "string",
        required: true,
        "description": "The host to connect to"
    }, {
        name: "port",
        type: "number",
        required: false,
        "description": "The port to use. Defaults to 22."
    }, {
        name: "identityFile",
        type: "string",
        required: false,
        "description": "The identity file to use"
    }, {
        name: "file",
        type: "string",
        required: false,
        "description": "The file to execute. File or command is required. If file is provided, the command will be read from the file."
    }, {
        name: "command",
        type: "string",
        required: false,
        "description": "The command to execute. File or command is required."
    }, {
        name: "args",
        type: "array",
        required: false,
        "description": "Additional arguments to pass to ssh"
    }],
    outputs: [{
        name: "user",
        type: "string",
    }, {
        name: "host",
        type: "string",
    }, {
        name: "port",
        type: "number",
    }, {
        name: "identityFile",
        type: "string",
        required: false,
    }, {
        name: "stdout",
        type: "string",
        required: false,
    }, {
        name: "stderr",
        type: "string",
        required: false,
    }],
    run: async (ctx: TaskContext) : Promise<Result<Outputs>> => {
        try {

            const inputs = ctx.state.inputs;
            const args = inputs.get("args") as string[] | undefined ?? [];
            let user = inputs.get("user") as string;
            let host = inputs.get("host") as string;
            const port = inputs.get("port") as number | undefined;
            let file = inputs.get("file") as string | undefined;
            let identityFile = inputs.get("identityFile") as string | undefined;
            let command = inputs.get("command") as string | undefined;
            let useOutput = inputs.get("useOutput") as boolean | undefined;

            if (!file && !command || (file?.length === 0 && command?.length === 0)) {
                return fail(new Error("Either a file or command must be provided"));
            }

            const g : (key: string) => string | undefined = (key) => {
                if (ctx.state.env.has(key))
                    return ctx.state.env.get(key);
                
                if (ctx.env.has(key))
                    return ctx.env.get(key);

                return env.get(key);
            }

            if (file && file.includes("$")) {
                file = env.expand(file, { get: g });
            }

            if (user.includes("$")) {
                user = env.expand(user, { get: g });
            }

            if (host.includes("$")) {
                host = env.expand(host, { get: g });
            }

            if (identityFile && identityFile.includes("$")) {
                identityFile = env.expand(identityFile, { get: g });
            }

            args.unshift("-o", "StrictHostKeyChecking=no");

            if (port) {
                args.unshift("-p", port.toString());
            }

            const splat = [...args];
            if (identityFile) {
                splat.unshift("-i", identityFile);
            }

            const cwd = ctx.state.cwd ?? ctx.cwd;
            const vars : Record<string, string> = {};
            const envDump = env.toObject()
            for (const key of ctx.state.env.keys()) {
                if (!envDump[key]) {
                    splat.push("-o", `SendEnv=${key}`)
                }
            }

            splat.push(`${user}@${host}`);

            if (file) {
                command = await readTextFile(file);
            }

            const copy = [...splat];
            splat.push(command!);
            copy.push(command!.slice(0, 100));

            ctx.writer.command("ssh", copy);
            const c = cmd("ssh", splat, {
                cwd,
                env: vars,
            });

            if (useOutput) {
                const res = await c.output();
                if (res.code !== 0) {
                    return fail(new Error(`Failed to execute ssh command. code ${res.code}, stderr: ${res.errorText()}`));
                }

                const o = new Outputs();
                o.set("user", user)
                o.set("host", host)
                o.set("port", port ?? 22)
                o.set("identityFile", identityFile);
                o.set("stdout", res.text());
                o.set("stderr", res.errorText());
                return ok(o);
            }

            const res = await c.run();
            if (res.code !== 0) {
                return fail(new Error(`Failed to execute ssh command. code ${res.code}`));
            }

            const o = new Outputs();
            o.set("user", user)
            o.set("host", host)
            o.set("port", port ?? 22)
            o.set("identityFile", identityFile);
            return ok(o);
        } catch (error) {
            return fail(toError(error));
        }
    }
});

export interface ScpParams extends Record<string | symbol, unknown> {
    user: string;
    host: string;
    port?: number;
    identityFile?: string;
    src: string;
    dest: string;
    args?: string[];
}

export interface ScpTask extends Task {
    params?: ScpParams;
}

export interface ScpTaskDef extends TaskDef {
    id: string;
    with: ScpParams | ((ctx: TaskContext) => Inputs | Promise<Inputs>);
}

export class ScpTaskBuilder extends TaskBuilder {

    constructor(task: ScpTask, map?: TaskMap) {
        super(task, map);

        if (task.params) {
            this.with(task.params);
        }
    }
}

export function scpTask(def: ScpTaskDef, map?: TaskMap): ScpTaskBuilder;
export function scpTask(id: string, params: ScpParams, map?: TaskMap): ScpTaskBuilder;
export function scpTask(
    id: string | ScpParams | ScpTaskDef,
    params?: ScpParams,
    needs?: string[] | TaskMap,
    map?: TaskMap,
): ScpTaskBuilder
export function scpTask() : ScpTaskBuilder {
    const uses = "@rex/ssh-native/scp";
    const first = arguments[0];
    const second = arguments[1];
    if (typeof first === 'object') {
        const def = first as ScpTaskDef;
        const task : ScpTask = {
            id: def.id,
            uses,
            cwd: def.cwd,
            force: def.force,
            if: def.if,
            timeout: def.timeout,
            description: def.description,
            needs: def.needs ?? [],
            name: def.name ?? def.id,
        }

        if (typeof def.with === 'function') {
            task.with = def.with;
        } else {
            task.params = def.with;
        }

        return new ScpTaskBuilder(task, arguments[1]);
    }

    const id = first as string;
    const params = second as ScpParams;
    const third = arguments[2];
    if (Array.isArray(third)) {
        const needs = third as string[];
        return new ScpTaskBuilder({
            id,
            uses,
            needs,
            params,
        }, arguments[3]);
    }

    return new ScpTaskBuilder({
        id,
        uses,
        params,
        needs: [],
    }, arguments[2]);
}

taskHandlerRegistery.set("@rex/ssh-native/scp", {
    id: "@rex/ssh-native/scp",
    inputs: [{
        name: "user",
        type: "string",
        required: true,
    }, {
        name: "host",
        type: "string",
        required: true,
    }, {
        name: "port",
        type: "number",
        required: false,
    }, {
        name: "identityFile",
        type: "string",
        required: false,
    }, {
        name: "src",
        type: "string",
        required: true,
    }, {
        name: "dest",
        type: "string",
        required: true,
    }, {
        name: "args",
        type: "array",
        required: false,
    }],
    outputs: [],
    run: async (ctx: TaskContext) : Promise<Result<Outputs>> => {
        try {

            const inputs = ctx.state.inputs;
            const args = inputs.get("args") as string[] | undefined ?? [];
            let user = inputs.get("user") as string;
            let host = inputs.get("host") as string;
            const port = inputs.get("port") as number | undefined;
            let src = inputs.get("src") as string;
            let dest = inputs.get("dest") as string;
            let identityFile = inputs.get("identityFile") as string | undefined;

            if (src === null || src === undefined || src === "") {
                return fail(new Error("src is required"));
            }

            if (dest === null || dest === undefined || dest === "") {
                return fail(new Error("dest is required"));
            }

            const g : (key: string) => string | undefined = (key) => {
                if (ctx.state.env.has(key))
                    return ctx.state.env.get(key);
                
                if (ctx.env.has(key))
                    return ctx.env.get(key);

                return env.get(key);
            }

            if (src.includes("$")) {
                src = env.expand(src, { get: g });
            }

            if (dest.includes("$")) {
                dest = env.expand(dest, { get: g });
            }

            if (user.includes("$")) {
                user = env.expand(user, { get: g });
            }

            if (host.includes("$")) {
                host = env.expand(host, { get: g });
            }

            if (identityFile && identityFile.includes("$")) {
                identityFile = env.expand(identityFile, { get: g });
            }

            args.unshift("-o", "StrictHostKeyChecking=no");

            if (port) {
                args.unshift("-P", port.toString());
            }

            const splat = [...args];
            if (identityFile) {
                splat.unshift("-i", identityFile);
            }

            const cwd = ctx.state.cwd ?? ctx.cwd;
            const vars : Record<string, string> = {};
            const envDump = env.toObject()
            for (const key of ctx.state.env.keys()) {
                if (!envDump[key]) {
                    splat.push("-o", `SendEnv=${key}`)
                }
            }

            splat.push(src);
            splat.push(`${user}@${host}:${dest}`);

            const res = await cmd("scp", splat, {
                cwd,
                env: vars,
            }).run();

            if (res.code !== 0) {
                return fail(new Error(`Failed to execute scp command. code ${res.code}`));
            }

            const o = new Outputs();
            o.set("user", user)
            o.set("host", host)
            o.set("port", port ?? 22)
            o.set("identityFile", identityFile);
            o.set("src", src);
            o.set("dest", dest);
            return ok(o);
        } catch (error) {
            return fail(toError(error));
        }
    }
});