import { underscore as og, type UnderScoreOptions } from "@bearz/slices/underscore";

/**
 * Converts the string to underscore case, generally from camel or pascal
 * case identifiers.
 * @param value The value to convert.
 * @param options The underscore conversion options.
 * @returns The string in underscore case.
 */
export function underscore(value: string, options?: UnderScoreOptions): string {
    const r = og(value, options);
    return String.fromCodePoint(...r);
}
