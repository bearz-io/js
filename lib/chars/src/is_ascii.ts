/**
 * Checks if the given value is an ASCII character.
 *
 * @param value - The value to check.
 * @returns `true` if the value is an ASCII character, `false` otherwise.
 *
 * @example
 * ```typescript
 * import { isAscii } from '@bearz/chars/is-ascii';
 *
 * const result = isAscii(65);
 * // result: true
 * ```
 */
export function isAscii(value: number): boolean {
    if (!Number.isInteger(value) || value < 0) {
        return false;
    }

    return value < 128;
}

/**
 * Checks if the character at the specified index in the given string is an ASCII character.
 *
 * @param str - The input string.
 * @param index - The index of the character to check.
 * @returns A boolean indicating whether the character at the specified index is an ASCII character.
 *
 * @example
 * ```typescript
 * import { isAsciiAt } from "@bearz/chars/is-ascii";
 * const str = "Hello, world!";
 * const index = 4;
 * const isAscii = isAsciiAt(str, index);
 * console.log(isAscii); // Output: true
 * ```
 */
export function isAsciiAt(value: string, index: number): boolean {
    const code = value.codePointAt(index);
    return code !== undefined && code > -1 && code < 128;
}
