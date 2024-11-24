import {
    type DelegateTask,
    output,
    REX_TASKS_REGISTRY,
    TaskBuilder,
    type TaskContext,
    type TaskMap,
    toError,
} from "./mod.ts";
import { Outputs } from "@rex/primitives";
import { fail, ok, type Result } from "@bearz/functional";
import { script as runScript } from "@bearz/shells";

// TODO: Write module code here
export class ScriptTaskBuilder extends TaskBuilder {
    constructor(task: DelegateTask, tasks?: TaskMap) {
        super(task, tasks);
    }
}

export function scriptTask(
    id: string,
    needs: string[],
    shell: string,
    script: string,
): ScriptTaskBuilder;
export function scriptTask(id: string, shell: string, script: string): ScriptTaskBuilder;
export function scriptTask(id: string, script: string): ScriptTaskBuilder;
export function scriptTask(): ScriptTaskBuilder {
    const id = arguments[0];
    let script: string = "";
    let shell: string | undefined = undefined;
    let needs: string[] = [];

    switch (arguments.length) {
        case 2:
            script = arguments[1];
            break;
        case 3:
            script = arguments[2];
            shell = arguments[1];
            break;

        case 4:
            needs = arguments[1];
            script = arguments[3];
            shell = arguments[2];
            break;

        default:
            throw new Error("Invalid number of arguments");
    }

    return new ScriptTaskBuilder({
        id: id,
        uses: "shell-task",
        needs: needs,
        run: async (ctx: TaskContext) => {
            const inputs = ctx.state.inputs;
            let runtimeShell = shell;
            if (inputs.has("shell")) {
                const s = inputs.string("shell");
                if (s.isSome) {
                    runtimeShell = s.unwrap();
                }
            }

            const o = await runScript(script, {
                shell: runtimeShell,
                cwd: ctx.state.cwd,
                env: ctx.state.env.toObject(),
                timeout: ctx.state.timeout,
            }).run();

            if (o.code !== 0) {
                throw new Error(`The shell script for task ${id} failed with code ${o.code}`);
            }

            return output({
                code: o.code,
                shell: shell,
                cwd: ctx.state.cwd,
            });
        },
    });
}

REX_TASKS_REGISTRY.set("shell-task", {
    id: "shell-task",
    description: "an inline task",
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
