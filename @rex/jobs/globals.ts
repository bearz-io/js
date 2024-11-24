import { JobMap } from "./primitives.ts";

const REX_JOBS_SYMBOL = Symbol("@@REX_JOBS");

const g = globalThis as Record<symbol, unknown>;

if (!g[REX_JOBS_SYMBOL]) {
    g[REX_JOBS_SYMBOL] = new JobMap();
}

export const REX_JOBS = g[REX_JOBS_SYMBOL] as JobMap;
