import {
    type DelegateTask,
    rexTaskHandlerRegistry,
    type TaskContext,
    type TaskMap,
    toError,
} from "@rex/tasks";
import { Outputs } from "@rex/primitives";
import { ScriptTaskBuilder, type ScriptTaskDef } from "../shells/core.ts";
import { fail, ok, type Result } from "@bearz/functional";
import { pwshScript } from "@spawn/pwsh";

/**
 * Creates a new PowerShell Core script task.
 * @param id The unique identifier of the task.
 * @param script The script to run.
 * @param tasks The task collection to add the task to.
 *
 * ```ts
 * import { pwsh } from "@rex/shells";
 *
 * pwsh("build", "build.ps1");
 * pwsh("hello", "Write-Host 'Hello, World!'");
 * ```
 */
export function pwsh(id: string, script: string, tasks?: TaskMap): ScriptTaskBuilder;
/**
 * Creates a new PowerShell Core script task.
 * @param id The unique identifier of the task.
 * @param script The script to run.
 * @param needs The tasks that this task depends on.
 * @param tasks The task collection to add the task to.
 *
 * ```ts
 * import { pwsh } from "@rex/shells";
 *
 * pwsh("build", ["hello"], "build.ps1");
 * pwsh("hello", "Write-Host 'Hello, World!'");
 * ```
 */
export function pwsh(
    id: string,
    script: string,
    needs?: string[],
    tasks?: TaskMap,
): ScriptTaskBuilder;
/**
 * Creates a new PowerShell Core script task.
 * @param def The task definition.
 * @param tasks The task collection to add the task to.
 *
 * ```ts
 * import { pwsh } from "@rex/shells";
 *
 * pwsh({
 *   id: "build",
 *   script: "build.ps1",
 * });
 * ```
 */
export function pwsh(def: ScriptTaskDef, tasks?: TaskMap): ScriptTaskBuilder;
export function pwsh(): ScriptTaskBuilder {
    const uses = "pwsh";
    const first = arguments[0];
    const second = arguments[1];

    if (typeof first === "object") {
        const def = first as ScriptTaskDef;
        const task: DelegateTask = {
            id: def.id,
            uses,
            name: def.name ?? def.id,
            cwd: def.cwd,
            env: def.env,
            description: def.description,
            force: def.force,
            needs: def.needs,
            if: def.if,
            timeout: def.timeout,
            run: async (ctx) => {
                const o = await pwshScript(def.script, {
                    cwd: ctx.state.cwd,
                    env: ctx.state.env.toObject(),
                    signal: ctx.signal,
                }).run();

                if (ctx.signal.aborted) {
                    return new Outputs();
                }

                if (o.code !== 0) {
                    throw new Error(`pwsh script failed with exit code ${o.code}`);
                }

                return Outputs.fromObject({
                    code: o.code,
                });
            },
        };

        return new ScriptTaskBuilder(task, arguments[1] as TaskMap);
    }

    const id = first as string;
    const script = second as string;
    const third = arguments[2];
    const needs = third && Array.isArray(third) ? third as string[] : undefined;
    let tasks: TaskMap | undefined = undefined;
    if (needs) {
        tasks = arguments[3] as TaskMap | undefined;
    } else {
        tasks = arguments[2] as TaskMap | undefined;
    }

    return new ScriptTaskBuilder({
        id: id,
        uses,
        needs: needs,
        name: id,
        run: async (ctx) => {
            const o = await pwshScript(script, {
                cwd: ctx.state.cwd,
                env: ctx.state.env.toObject(),
                signal: ctx.signal,
            }).run();

            if (ctx.signal.aborted) {
                return new Outputs();
            }

            if (o.code !== 0) {
                throw new Error(`pwsh script failed with exit code ${o.code}`);
            }

            return Outputs.fromObject({
                code: o.code,
            });
        },
    }, tasks);
}

const taskHandlerRegistry = rexTaskHandlerRegistry();

taskHandlerRegistry.set("pwsh", {
    id: "pwsh",
    description: "a pwsh task",
    inputs: [],
    outputs: [],
    run: async (ctx: TaskContext): Promise<Result<Outputs>> => {
        const task = ctx.task as DelegateTask;
        if (task.run === undefined) {
            return fail(new Error(`Task ${task.id} has no run function`));
        }

        try {
            const res = task.run(ctx);
            if (res instanceof Promise) {
                const out = await res;
                if (out instanceof Outputs) {
                    return ok(out);
                }

                return ok(new Outputs());
            }

            if (res instanceof Outputs) {
                return ok(res);
            }

            return ok(new Outputs());
        } catch (e) {
            return fail(toError(e));
        }
    },
});
