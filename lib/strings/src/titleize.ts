import { titleize as og } from "@bearz/slices/titleize";

/**
 * Converts the string to title case.
 * @param s The string to titleize.
 * @returns The titleized string.
 */
export function titleize(s: string): string {
    const r = og(s);

    return String.fromCodePoint(...r);
}
