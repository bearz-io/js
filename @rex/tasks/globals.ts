import { TaskHandlerRegistry, TaskMap } from "./types.ts";

const REX_TASKS_SYMBOL = Symbol.for("@@REX_TASKS");
const REX_TASK_HANDLERS_SYMBOL = Symbol.for("REX_TASK_HANDLER_REGISTRY");

const g = globalThis as Record<symbol, unknown>;

if (!g[REX_TASKS_SYMBOL]) {
    g[REX_TASKS_SYMBOL] = new TaskMap();
}

/**
 * The global task map.
 */
export const REX_TASKS = g[REX_TASKS_SYMBOL] as TaskMap;

if (!g[REX_TASK_HANDLERS_SYMBOL]) {
    g[REX_TASK_HANDLERS_SYMBOL] = new TaskHandlerRegistry();
}

/**
 * The global task handler registry.
 */
export const REX_TASKS_REGISTRY = g[REX_TASK_HANDLERS_SYMBOL] as TaskHandlerRegistry;

/**
 * Gets the global task handler registry.
 * @returns The global task handler registry.
 */
export function rexTaskHandlerRegistry(): TaskHandlerRegistry {
    return g[REX_TASK_HANDLERS_SYMBOL] as TaskHandlerRegistry;
}

/**
 * Gets the global task map.
 * @returns The global task map.
 */
export function rexTasks(): TaskMap {
    return g[REX_TASKS_SYMBOL] as TaskMap;
}
