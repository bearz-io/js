import { env, type SubstitutionOptions } from "@bearz/env";

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
