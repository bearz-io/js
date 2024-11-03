import { expand } from "./expand.ts";
import { env } from "@bearz/env";

/**
 * Options for loading environment variables.
 */
export interface LoadOptions {
    /**
     * If true, existing environment variables will not be overwritten.
     * @default false
     */
    skipExisiting?: boolean;

    /**
     * If true, variable expansion will be skipped.
     * @default false
     */
    skipExpansion?: boolean;
}

/**
 * Loads environment variables from the given source object into the environment.
 *
 * @param source - A record containing key-value pairs of environment variables.
 * @param options - Optional settings for loading the environment variables.
 * @param options.skipExpansion - If true, skips the expansion of variables.
 * @param options.skipExisiting - If true, skips setting variables that already exist in the environment.
 */
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
