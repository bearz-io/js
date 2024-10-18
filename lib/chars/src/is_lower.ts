import type { Char } from "./types.ts";
import { is16, is32, latin1, pLl } from "./tables/latin1.ts";
import { Ll } from "./tables/ll.ts";

/**
 * Checks if the given value represents a lowercase letter.
 * @param char The char to check.
 * @returns `true` if the value represents a lowercase letter; otherwise, `false`.
 *
 * @example
 * ```ts
 * import { isLower } from "@bearz/chars/is-lower";
 *
 * console.log(isLower(0x61)); // Output: true
 * console.log(isLower(0x41)); // Output: false
 * console.log(isLower(0x10FFFF)); // Output: false
 * console.log(isLower(0.32)); // Output: false
 * ```
 */
export function isLower(char: Char): boolean {
    if (Number.isInteger(char) === false || char < 0 || char > 0x10FFFF) {
        return false;
    }

    if (char < 256) {
        return (latin1[char] & pLl) !== 0;
    }

    const hi = Ll.R16[Ll.R16.length - 1][1];
    if (char <= hi) {
        return is16(Ll.R16, char);
    }

    const lo = Ll.R32[0][0];
    if (char >= lo) {
        return is32(Ll.R32, char);
    }

    return false;
}

/**
 * Checks if the given value represents a lowercase letter.
 *
 * @description
 * The function skips the type check and the range check for a small performance boost.
 *
 * @param char The char to check.
 * @returns `true` if the value represents a lowercase letter; otherwise, `false`.
 *
 * @example
 * ```ts
 * import { isLowerUnsafe } from "@bearz/chars/is-lower";
 *
 * console.log(isLowerUnsafe(0x61)); // Output: true
 * console.log(isLowerUnsafe(0x41)); // Output: false
 * console.log(isLowerUnsafe(0x10FFFF)); // Output: false
 * console.log(isLowerUnsafe(0.32)); // Output: false
 * ```
 */
export function isLowerUnsafe(char: Char): boolean {
    if (char < 256) {
        return (latin1[char] & pLl) !== 0;
    }

    const hi = Ll.R16[Ll.R16.length - 1][1];
    if (char <= hi) {
        return is16(Ll.R16, char);
    }

    const lo = Ll.R32[0][0];
    if (char >= lo) {
        return is32(Ll.R32, char);
    }

    return false;
}

/**
 * Checks if the character at the specified index in the given string is a lowercase letter.
 *
 * @param str The string to check.
 * @param index The index of the character to check.
 * @returns `true` if the character at the specified index is a lowercase letter; otherwise, `false`.
 *
 * @example
 * ```ts
 * import { isLowerAt } from "@bearz/chars/is-lower";
 *
 * const str = "Hello, world!";
 * console.log(isLowerAt(str, 5)); // Output: false
 * console.log(isLowerAt(str, 2)); // Output: true
 * console.log(isLowerAt(str, 0)); // Output: false
 * ```
 */
export function isLowerAt(str: string, index: number): boolean {
    const code = str.codePointAt(index) ?? 0;
    return isLowerUnsafe(code);
}
