const g = globalThis as Record<string, unknown>;

export interface InspectOptions {
    depth?: number;
    colors?: boolean;
    indentLevel?: number;
    sorted?: boolean;
    trailingComma?: boolean;
    compact?: boolean;
    iterableLimit?: number;
    showProxy?: boolean;
    getters?: boolean;
    showHidden?: boolean;
    hideKeys?: string[];
    maxArrayLength?: number;
    maxStringLength?: number;
    breakLength?: number;
    compactThreshold?: number;
}

// deno-lint-ignore no-unused-vars
let inspectValue = function (value: unknown, options?: InspectOptions): string {
    return JSON.stringify(value, null, 2);
};

if (g.Deno) {
    inspectValue = Deno.inspect;
} else if (g.process) {
    const nodeInspect = await import("node:util").then((mod) => mod.inspect);
    inspectValue = nodeInspect;
}

/**
 * Returns a string representation of the given value.
 * @param value The value to inspect.
 * @param options The options for the function.
 * @returns A string representation of the given value.
 */
export function inspect(value: unknown, options?: InspectOptions): string {
    return inspectValue(value, options);
}
