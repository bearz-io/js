import { pascalize as og } from "@bearz/slices/pascalize";

/**
 * Converts the string to pascal case. This is primarily for converting
 * code to pascal case.
 * @param value The string to pascalize.
 * @param options The options for the function.
 * @returns A string in camel case.
 */
export function pascalize(value: string): string {
    const r = og(value);
    return String.fromCodePoint(...r);
}
