import { env, type SubstitutionOptions } from "@bearz/env";

/**
 * Expands environment variables within a given source object.
 *
 * @param source - A record containing key-value pairs where the values may contain environment variable references.
 * @param options - Optional substitution options to customize the expansion behavior.
 * @returns A new record with the expanded values.
 */
export function expand(
    source: Record<string, string>,
    options?: SubstitutionOptions,
): Record<string, string> {
    const map: Record<string, string> = {};

    const o = options ?? {};
    o.get ??= (key: string) => {
        if (key in map) {
            return map[key];
        }

        return env.get(key);
    };
    o.set ??= (key: string, value: string) => {
        map[key] = value;
    };

    for (const key in source) {
        const value = source[key];
        map[key] = env.expand(value, o);
    }

    return map;
}
