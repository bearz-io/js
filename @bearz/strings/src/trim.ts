import {
    trimChar as ogChar,
    trimEndChar as ogEndChar,
    trimEndSlice as ogEndSlice,
    trimSlice as ogSlice,
    trimStartChar as ogStartChar,
    trimStartSlice as ogStartSlice,
} from "@bearz/slices/trim";
import { type CharBuffer, toCharSliceLike } from "@bearz/slices/utils";

/**
 * Trims the trailing character from the string.
 * @param value The string to trim.
 * @param suffix The character suffix to trim.
 * @returns The trimmed string.
 */
export function trimEndChar(value: string, suffix: number): string {
    const r = ogEndChar(value, suffix);
    return String.fromCodePoint(...r);
}

/**
 * Trims the trailing characters from the string.
 * @param value The string to trim.
 * @param suffix The characters suffix to trim.
 * @returns The trimmed string.
 */
export function trimEndSlice(value: string, prefix: CharBuffer): string {
    const r = ogEndSlice(value, prefix);
    return String.fromCodePoint(...r);
}

/**
 * Trims the trailing characters from the string.
 * @param value The string to trim.
 * @param suffix The characters suffix to trim. If not provided, all trailing
 * whitespace characters are removed.
 * @returns The trimmed string.
 */
export function trimEnd(value: string, suffix?: CharBuffer): string {
    if (suffix === undefined) {
        return value.trimEnd();
    }

    if (suffix.length === 1) {
        const t = toCharSliceLike(suffix);
        const rune = t.at(0) ?? -1;
        return trimEndChar(value, rune);
    }

    return trimEndSlice(value, suffix);
}

/**
 * Trims the leading character from the string.
 * @param value The string to trim.
 * @param prefix The character prefix to trim.
 * @returns The trimmed string.
 */
export function trimStartChar(value: string, prefix: number): string {
    const r = ogStartChar(value, prefix);
    return String.fromCodePoint(...r);
}

/**
 * Trims the leading characters from the string.
 * @param value The string to trim.
 * @param prefix The characters prefix to trim.
 * @returns The trimmed string.
 */
export function trimStartSlice(value: string, prefix: CharBuffer): string {
    const r = ogStartSlice(value, prefix);
    return String.fromCodePoint(...r);
}

/**
 * Trims the leading character from the string.
 * @param value The string to trim.
 * @param prefix The character prefix to trim. If not provided, all leading
 * whitespace characters are removed.
 * @returns The trimmed string.
 */
export function trimStart(value: string, prefix?: CharBuffer): string {
    if (prefix === undefined) {
        return value.trimStart();
    }

    if (prefix.length === 1) {
        const t = toCharSliceLike(prefix);
        const rune = t.at(0) ?? -1;

        return trimStartChar(value, rune);
    }

    return trimStartSlice(value, prefix);
}

/**
 * Trims the leading and trailing character from the string.
 * @param value The string to trim.
 * @param char The character to trim.
 * @returns The trimmed string.
 */
export function trimChar(value: string, char: number): string {
    const r = ogChar(value, char);
    return String.fromCodePoint(...r);
}

/**
 * Trims the leading and trailing characters from the string.
 * @param value The string to trim.
 * @param chars The characters to trim.
 * @returns The trimmed string.
 */
export function trimSlice(value: string, chars: CharBuffer): string {
    const r = ogSlice(value, chars);
    return String.fromCodePoint(...r);
}

/**
 * Trims the leading and trailing characters from the string.
 * @param value The string to trim.
 * @param chars The characters to trim. If not provided, all leading
 * whitespace characters are removed.
 * @returns The trimmed string.
 */
export function trim(value: string, chars?: CharBuffer): string {
    if (chars === undefined) {
        return value.trim();
    }

    if (chars.length === 1) {
        const t = toCharSliceLike(chars);
        const rune = t.at(0) ?? -1;

        return trimChar(value, rune);
    }

    return trimSlice(value, chars);
}
