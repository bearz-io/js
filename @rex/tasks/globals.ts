import { TaskMap, TaskHandlerRegistry } from "./primitives.ts";

const REX_TASKS_SYMBOL = Symbol("@@REX_TASKS");
const REX_TASK_HANDLERS_SYMBOL = Symbol("REX_TASK_HANDLER_REGISTRY");

const g = globalThis as Record<symbol, unknown>;

if (!g[REX_TASKS_SYMBOL]) {
    g[REX_TASKS_SYMBOL] = new TaskMap();
}

export const REX_TASKS = g[REX_TASKS_SYMBOL] as TaskMap;

if (!g[REX_TASK_HANDLERS_SYMBOL]) {
    g[REX_TASK_HANDLERS_SYMBOL] = new TaskHandlerRegistry();
}

export const REX_TASKS_REGISTRY = g[REX_TASK_HANDLERS_SYMBOL] as TaskHandlerRegistry;

export function getTaskHandlerRegistry(): TaskHandlerRegistry {
    return g[REX_TASK_HANDLERS_SYMBOL] as TaskHandlerRegistry;
}

export function getGlobalTasks(): TaskMap {
    return g[REX_TASKS_SYMBOL] as TaskMap;
}
