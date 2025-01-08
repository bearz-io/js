import { JobMap } from "./types.ts";

const REX_JOBS_SYMBOL = Symbol("@@REX_JOBS");

const g = globalThis as Record<symbol, unknown>;

if (!g[REX_JOBS_SYMBOL]) {
    g[REX_JOBS_SYMBOL] = new JobMap();
}

/**
 * Gets the global job map for rex.
 * @returns The global job map.
 */
export function rexJobs(): JobMap {
    return g[REX_JOBS_SYMBOL] as JobMap;
}
