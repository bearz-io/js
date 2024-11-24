import { latin1, pC } from "./tables/latin1.ts";
import type { Char } from "./types.ts";

/**
 * Determines whether the given character is a control character.
 * @param char The character to check.
 * @returns `true` if the character is a control character; otherwise, `false`.'
 *
 * @example
 * ```ts
 * import { IsControl } from "@bearz/chars/is-control";
 *
 * console.log(isControl(0x10FFFF)); // Output: false
 * console.log(isControl(0.32)); // Output: false
 * console.log(isControl(10)); // Output: true
 * ```
 */
export function isControl(char: Char): boolean {
    if (!Number.isInteger(char) || (char < 0 || char > 255)) {
        return false;
    }

    return (latin1[char] & pC) !== 0;
}

/**
 * Determines whether the given character is a control character.
 *
 * @description
 * Skips the type check and error handling for a faster execution. It should
 * used when the character is known to be a valid Unicode code point such as
 * calling `codePointAt` on a string.
 *
 * @param char The character to check.
 * @returns `true` if the character is a control character; otherwise, `false`.'
 *
 * @example
 * ```ts
 * import { IsControl } from "@bearz/chars/is-control";
 *
 * console.log(isControl(0x10FFFF)); // Output: false
 * console.log(isControl(0.32)); // Output: false
 * console.log(isControl(10)); // Output: true
 * ```
 */
export function isControlUnsafe(char: Char): boolean {
    return (latin1[char] & pC) !== 0;
}

/**
 * Determines whether the character at the specified index in the given string is a control character.
 * @param str The input string.
 * @param index The index of the character to check.
 * @returns `true` if the character at the specified index is a control character; otherwise, `false`.
 *
 * @example
 * ```ts
 * import { isControlAt } from "@bearz/chars/is-control";
 *
 * const str = "Hello, world!";
 * const index = 4;
 * const isControl = isControlAt(str, index);
 * console.log(isControl); // Output: false
 * ```
 */
export function isControlAt(str: string, index: number): boolean {
    const code = str.codePointAt(index) ?? 0;
    return (latin1[code] & pC) !== 0;
}
