import { isSpaceAt } from "@bearz/chars/is-space";

/**
 * Determines whether the string is null.
 * @param s The string to check.
 * @returns `true` if the string is null or undefined; otherwise, `false`.
 */
export function isNull(s: string | null): s is null {
    return s === null;
}

/**
 * Determines whether the string is undefined.
 * @param s The string to check.
 * @returns `true` if the string is undefined; otherwise, `false`.
 */
export function isUndefined(s: string | undefined): s is undefined {
    return s === undefined;
}

/**
 * Determines whether the string is empty.
 * @param s The string to check.
 * @returns `true` if the string is empty; otherwise, `false`.
 */
export function isEmpty(s: string): s is "" {
    return s.length === 0;
}

/**
 * Determines whether the string is null, undefined, or empty.
 * @param s The string to check.
 * @returns `true` if the string is null or undefined or empty; otherwise, `false`.
 */
export function isNullOrEmpty(s?: string | null): s is undefined | null | "" {
    return s === null || s === undefined || s.length === 0;
}

/**
 * Determines whether the string only contains whitespace.
 * @param s The string to check.
 * @returns `true` if the string only contains whitespace; otherwise, `false`.
 */
export function isSpace(s: string): boolean {
    for (let i = 0; i < s.length; i++) {
        if (!isSpaceAt(s, i)) {
            return false;
        }
    }

    return true;
}

/**
 * Determines whether the string is null, undefined, empty, or only contains whitespace.
 * @param s The string to check.
 * @returns `true` if the string is null, undefined, empty, or
 * only contains whitespace; otherwise, `false`.
 */
export function isNullOrSpace(s?: string | null): s is null | undefined | "" {
    if (s === null || s === undefined || s.length === 0) {
        return true;
    }

    for (let i = 0; i < s.length; i++) {
        if (!isSpaceAt(s, i)) {
            return false;
        }
    }

    return true;
}
