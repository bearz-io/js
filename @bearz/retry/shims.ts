export interface Timeout {
    // deno-lint-ignore no-explicit-any
    unref(): any;
}

export let shimClearTimeout : (timeout: number | Timeout) => void  = (timeout: number | Timeout) => {
    if (typeof timeout === "number") {
        clearTimeout(timeout);
        return;
    }

    throw new Error("clearTimeout is set to use the browser API.");
}

export let shimSetTimeout : (fn: () => void, timeout: number | Timeout) => number | Timeout = (fn: () => void, timeout: number | Timeout) => {
    if (typeof timeout === "number") {
        return setTimeout(fn, timeout);
    }
    
    throw new Error("setTimeout is set to use the browser API.");
}

export function setShimClearTimeout(fn: (timeout: number | Timeout) => void) {
    shimClearTimeout = fn;
}

export function setShimSetTimeout(fn: (fn: () => void, timeout: number | Timeout) => number) {
    shimSetTimeout = fn;
}

const g = globalThis as Record<string | symbol, unknown>;

if (g.process) {
    const { setTimeout, clearTimeout } = await import("node:timers");

    shimSetTimeout = (fn: () => void, timeout: number | Timeout) => {
        return setTimeout(fn, timeout as number);
    }

    shimClearTimeout = (timeout: number | Timeout) => {
        clearTimeout(timeout as number);
    }
}