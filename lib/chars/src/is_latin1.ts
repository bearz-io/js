/**
 * Checks if the given value is a Latin-1 character.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a Latin-1 character, `false` otherwise.
 *
 * @example
 * ```typescript
 * import { isLatin1 } from '@bearz/chars/is-latin1';
 *
 * console.log(isLatin1("Ď".charCodeAt(0))); // Output: false
 * console.log(isLatin1(65)); // Output: true
 * console.log(isLatin1(256)); // Output: false
 * ```
 */
export function isLatin1(value: number): boolean {
    if (!Number.isInteger(value) || value < 0) {
        return false;
    }

    return value < 256;
}

/**
 * Checks if the character at the specified index in the given string is a Latin-1 character.
 * Latin-1 characters have code points less than the `latinMax` constant.
 *
 * @param value - The string to check.
 * @param index - The index of the character to check.
 * @returns `true` if the character at the specified index is a Latin-1 character, `false` otherwise.
 *
 * @example
 * ```typescript
 * import { isLatin1At } from "@bearz/chars/is";
 *
 * const str = "Hello, world!";
 * const index = 4;
 * const isLatin1 = isLatin1At(str, index);
 * console.log(isLatin1); // Output: true
 * ```
 */
export function isLatin1At(value: string, index: number): boolean {
    const code = value.codePointAt(index);
    return code !== undefined && code > -1 && code < 256;
}
