import { type DelegateTask, TaskBuilder, type TaskDef, type TaskMap } from "@rex/tasks";

export interface ScriptTaskDef extends TaskDef {
    /**
     * The unique identifier of the task.
     */
    id: string;

    /**
     * The script to run.
     */
    script: string;
}

export class ScriptTaskBuilder extends TaskBuilder {
    constructor(task: DelegateTask, tasks?: TaskMap) {
        super(task, tasks);
    }
}
