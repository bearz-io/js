import type { Char } from "./types.ts";
import { is16, is32, latin1, pS } from "./tables/latin1.ts";
import { S } from "./tables/s.ts";

/**
 * Determines whether the given character is a symbol.
 * @param char The character to check.
 * @returns `true` if the character is a symbol; otherwise, `false`.
 *
 * @example
 * ```ts
 * import { isSymbol } from "@bearz/chars/is-symbol";
 *
 * console.log(isSymbol(0x1F600)); // Output: false
 * console.log(isSymbol(0x110000)); // Output: false
 * console.log(isSymbol(0x10FFFF)); // Output: false
 * console.log(isSymbol(0.32)); // Output: false
 * console.log(isSymbol(0x2B)); // Output: true
 * ```
 */
export function isSymbol(char: Char): boolean {
    if (Number.isInteger(char) === false || char < 0 || char > 255) {
        return false;
    }

    if (char < 256) {
        return (latin1[char] & pS) !== 0;
    }

    const hi = S.R16[S.R32.length - 1][1];
    if (char <= hi) {
        return is16(S.R16, char);
    }

    const lo = S.R32[0][0];
    if (char >= lo) {
        return is32(S.R32, char);
    }

    return false;
}

/**
 * Determines whether the given character is a symbol.
 *
 * @description
 * The function skips the type check and the range check for a small performance boost.
 *
 * @param char The character to check.
 * @returns `true` if the character is a symbol; otherwise, `false`.
 *
 * @example
 * ```ts
 * import { isSymbolUnsafe } from "@bearz/chars/is-symbol";
 *
 * console.log(isSymbolUnsafe(0x1F600)); // Output: false
 * console.log(isSymbolUnsafe(0x110000)); // Output: false
 * console.log(isSymbolUnsafe(0x10FFFF)); // Output: false
 * console.log(isSymbolUnsafe(0.32)); // Output: false
 * console.log(isSymbolUnsafe(0x2B)); // Output: true
 * ```
 */
export function isSymbolUnsafe(char: Char): boolean {
    if (char < 256) {
        return (latin1[char] & pS) !== 0;
    }

    const hi = S.R16[S.R32.length - 1][1];
    if (char <= hi) {
        return is16(S.R16, char);
    }

    const lo = S.R32[0][0];
    if (char >= lo) {
        return is32(S.R32, char);
    }

    return false;
}

/**
 * Determines whether the given value is a valid Unicode symbol.
 * @param str The value to check.
 * @param index The index of the value to check.
 * @returns `true` if the value is a valid Unicode symbol; otherwise, `false`.
 * @example
 * ```ts
 * import { isSymbolAt } from "@bearz/chars/is-symbol";
 *
 * console.log(isSymbolAt("$2.40", 1)); // Output: true
 * console.log(isSymbolAt("€2.40", 0)); // Output: true
 * console.log(isSymbolAt("2.40€", 0)); // Output: false
 * ```
 */
export function isSymbolAt(str: string, index: number): boolean {
    const code = str.codePointAt(index) ?? 0;
    return isSymbol(code);
}
