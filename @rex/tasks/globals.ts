import { TaskMap, TaskRegistry } from "./primitives.ts";

const REX_TASKS_SYMBOL = Symbol("@@REX_TASKS");
const REX_REGISTRY_SYMBOL = Symbol("@@REX_REGISTRY");

const g = globalThis as Record<symbol, unknown>;

if (!g[REX_TASKS_SYMBOL]) {
    g[REX_TASKS_SYMBOL] = new TaskMap();
}

export const REX_TASKS = g[REX_TASKS_SYMBOL] as TaskMap;

if (!g[REX_REGISTRY_SYMBOL]) {
    g[REX_REGISTRY_SYMBOL] = new TaskRegistry();
}

export const REX_TASKS_REGISTRY = g[REX_REGISTRY_SYMBOL] as TaskRegistry;

export function getTaskRegistry(): TaskRegistry {
    return g[REX_REGISTRY_SYMBOL] as TaskRegistry;
}

export function getGlobalTasks(): TaskMap {
    return g[REX_TASKS_SYMBOL] as TaskMap;
}
