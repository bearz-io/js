import { indexOf as og, indexOfFold as ogFold } from "@bearz/slices/index-of";
import type { CharBuffer } from "@bearz/slices/utils";

/**
 * Gets the index of the first occurrence of the specified characters
 * in the string using case-insensitive comparison.
 * @param value The string to search.
 * @param chars The characters to search for.
 * @param index The index to start searching from.
 * @returns The index of the first occurrence of the characters in the string.
 * If the string is not found, returns -1.
 */
export function indexOfFold(value: string, chars: CharBuffer, index = 0): number {
    return ogFold(value, chars, index);
}

/**
 * Gets the index of the first occurrence of the specified characters
 * in the string.
 * @param value The string to search.
 * @param chars The characters to search for.
 * @param index The index to start searching from.
 * @returns The index of the first occurrence of the characters in the string.
 * If the string is not found, returns -1.
 */
export function indexOf(value: string, chars: CharBuffer, index = 0): number {
    return og(value, chars, index);
}
