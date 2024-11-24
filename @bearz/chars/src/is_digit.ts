import { Nd } from "./tables/nd.ts";
import { is16, is32, latin1, pN } from "./tables/latin1.ts";
import type { Char } from "./types.ts";

/**
 * Checks if the given value is a digit.
 *
 * @param char - The value to check.
 * @returns `true` if the value is a digit, `false` otherwise.
 *
 * @example
 * ```typescript
 * import { isDigit } from '@bearz/chars/is-digit';
 *
 * console.log(isDigit('5'.charCodeAt(0))); // Output: true
 * console.log(isDigit('a'.charCodeAt(0))); // Output: false
 * ```
 */
export function isDigit(char: number): boolean {
    if (Number.isInteger(char) === false || char < 0 || char > 0x10FFFF) {
        return false;
    }

    if (char < 256) {
        return (latin1[char] & pN) !== 0;
    }

    const hi = Nd.R16[Nd.R32.length - 1][1];
    if (char <= hi) {
        return is16(Nd.R16, char);
    }

    const lo = Nd.R32[0][0];
    if (char >= lo) {
        return is32(Nd.R32, char);
    }

    return false;
}

/**
 * Determines whether the given character is a digit.
 *
 * @param char The character to check.
 * @returns `true` if the character is a digit; otherwise, `false`.
 *
 * @example
 * ```ts
 * import { isDigitUnsafe } from "@bearz/chars/is-digit";
 *
 * console.log(isDigitUnsafe(0x10FFFF)); // Output: false
 * console.log(isDigitUnsafe(0.32)); // Output: false
 * console.log(isDigitUnsafe(10)); // Output: true
 * ```
 */
export function isDigitUnsafe(char: Char): boolean {
    if (char < 256) {
        return (latin1[char] & pN) !== 0;
    }

    const hi = Nd.R16[Nd.R32.length - 1][1];
    if (char <= hi) {
        return is16(Nd.R16, char);
    }

    const lo = Nd.R32[0][0];
    if (char >= lo) {
        return is32(Nd.R32, char);
    }

    return false;
}

/**
 * Checks if the character at the specified index in the given string is a digit.
 *
 * @param value - The string to check.
 * @param index - The index of the character to check.
 * @returns `true` if the character at the specified index is a digit, `false` otherwise.
 * @example
 * ```typescript
 * import { isDigitAt } from "@bearz/chars/is-digit";
 *
 * const str = "Hello, world!";
 * const index = 4;
 * const isDigit = isDigitAt(str, index);
 * console.log(isDigit); // Output: false
 *
 * const str1 = "Hello, 123!";
 * const index1 = 8;
 * const isDigit1 = isDigitAt(str1, index1);
 * console.log(isDigit1); // Output: true
 *
 * ```
 */
export function isDigitAt(value: string, index: number): boolean {
    const code = value.codePointAt(index) ?? 0;
    return isDigitUnsafe(code);
}
