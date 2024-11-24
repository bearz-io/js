import { BaseMessage } from "../bus.ts";
import type { Task, TaskMap, TaskResult, TaskState } from "@rex/tasks";

export class TaskStarted extends BaseMessage {
    constructor(public readonly task: TaskState) {
        super("task:started");
    }
}

export class TaskCompleted extends BaseMessage {
    constructor(public readonly task: TaskState, public readonly result: TaskResult) {
        super("task:completed");
    }
}

export class TaskSkipped extends BaseMessage {
    constructor(public readonly task: TaskState) {
        super("task:skipped");
    }
}

export class TaskFailed extends BaseMessage {
    constructor(public readonly task: TaskState, public readonly error: Error) {
        super("task:failed");
    }
}

export class TaskCancelled extends BaseMessage {
    constructor(public readonly task: TaskState) {
        super("task:cancelled");
    }
}

export class MissingTaskDependencies extends BaseMessage {
    constructor(public readonly tasks: Array<{ task: Task; missing: string[] }>) {
        super("tasks:missing-dependencies");
    }
}

export class CyclicalTaskReferences extends BaseMessage {
    constructor(public readonly tasks: Task[]) {
        super("tasks:cyclical-references");
    }
}

export class TaskNotFound extends BaseMessage {
    constructor(public readonly taskName: string) {
        super("task:not-found");
    }
}

export class ListTasks extends BaseMessage {
    constructor(public readonly tasks: TaskMap) {
        super("tasks:list");
    }
}
