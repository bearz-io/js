import { dasherize as og, type DasherizeOptions } from "@bearz/slices/dasherize";

/**
 * Dasherizes the string by replacing ' ', '-' and '_' with '-' and converting
 * pascal case to kebab case. This is primarily for converting code to
 * kebab case.
 * @param value The string to dasherize.
 * @param options The options for dasherizing the string
 * @returns The dasherized string.
 */
export function dasherize(value: string, options?: DasherizeOptions): string {
    const r = og(value, options);
    return String.fromCodePoint(...r);
}
