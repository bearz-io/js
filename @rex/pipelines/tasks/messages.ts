import { BaseMessage } from "../bus.ts";
import type { Task, TaskMap, TaskResult, TaskState } from "@rex/tasks";

/**
 * Task started message
 */
export class TaskStarted extends BaseMessage {
    /**
     * Creates a new TaskStarted message.
     * @param task The task state.
     */
    constructor(public readonly task: TaskState) {
        super("task:started");
    }
}

/**
 * Task completed message
 */
export class TaskCompleted extends BaseMessage {
    /**
     * Creates a new TaskCompleted message.
     * @param task The task state.
     * @param result The task result.
     */
    constructor(public readonly task: TaskState, public readonly result: TaskResult) {
        super("task:completed");
    }
}

/**
 * Task skipped message
 */
export class TaskSkipped extends BaseMessage {
    /**
     * Creates a new TaskSkipped message.
     * @param task The task state.
     */
    constructor(public readonly task: TaskState) {
        super("task:skipped");
    }
}

/**
 * Task failed message
 */
export class TaskFailed extends BaseMessage {
    /**
     * Creates a new TaskFailed message.
     * @param task The task state.
     * @param error The error.
     */
    constructor(public readonly task: TaskState, public readonly error: Error) {
        super("task:failed");
    }
}

/**
 * Task cancelled message
 */
export class TaskCancelled extends BaseMessage {
    /**
     * Creates a new TaskCancelled message.
     * @param task The task state.
     * @param reason The reason for the cancellation.
     */
    constructor(public readonly task: TaskState, public readonly reason: string) {
        super("task:cancelled");
    }
}

/**
 * Task not found message
 */
export class MissingTaskDependencies extends BaseMessage {
    /**
     * Creates a new MissingTaskDependencies message.
     * @param tasks The tasks with missing dependencies.
     */
    constructor(public readonly tasks: Array<{ task: Task; missing: string[] }>) {
        super("tasks:missing-dependencies");
    }
}

/**
 * Task cyclical references message
 */
export class CyclicalTaskReferences extends BaseMessage {
    /**
     * Creates a new CyclicalTaskReferences message.
     * @param tasks The tasks with cyclical references.
     */
    constructor(public readonly tasks: Task[]) {
        super("tasks:cyclical-references");
    }
}

/**
 * Task not found message
 */
export class TaskNotFound extends BaseMessage {
    /**
     * Creates a new TaskNotFound message.
     * @param taskName The task name.
     */
    constructor(public readonly taskName: string) {
        super("task:not-found");
    }
}

/**
 * List tasks message
 */
export class ListTasks extends BaseMessage {
    /**
     * Creates a new ListTasks message.
     * @param tasks The tasks.
     */
    constructor(public readonly tasks: TaskMap) {
        super("tasks:list");
    }
}
