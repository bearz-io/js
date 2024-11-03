import { expand } from "./expand.ts";
import { env } from "@bearz/env";

export interface LoadOptions {
    skipExisiting?: boolean;
    skipExpansion?: boolean;
}

export function load(source: Record<string, string>, options?: LoadOptions): void {
    if (!options?.skipExpansion) {
        source = expand(source);
    }

    for (const key in source) {
        if (options?.skipExisiting && env.has(key)) {
            continue;
        }

        env.set(key, source[key]);
    }
}
