import type { Char } from "./types.ts";
import { CaseRanges } from "./tables/case.ts";
import { MAX_RUNE } from "./constants.ts";
/**
 * Converts a lowercase letter to uppercase.
 * If the input value is already uppercase or a non-letter, it returns the input value as is.
 * If the input value is a lowercase letter, it converts it to uppercase using the specified locales.
 * @param char - The Unicode value of the character to convert.
 * @param locales - Optional. A string or an array of strings that specify the locales to use for the conversion.
 * @returns The Unicode value of the uppercase character.
 *
 * @example
 * ```typescript
 * import { toUpper } from '@bearz/chars';
 *
 * console.log(toUpper(65)); // Output: 65
 * console.log(toUpper(97)); // Output: 65
 * console.log(toUpper(48)); // Output: 48
 * ```
 */
export function toUpper(char: Char): Char {
    if (!Number.isInteger(char) || (char < 1 || char > 0x10FFFF)) {
        return char;
    }

    if (char < 128) {
        if (char >= 97 && char <= 122) {
            return char - 32;
        }
        return char;
    }

    let lo = 0;
    let hi = CaseRanges.length;
    while (lo < hi) {
        const mid = lo + hi >>> 1;
        const range = CaseRanges[mid];
        const l = range[0] as number;
        const h = range[1] as number;
        const d = range[2] as number[];
        if ((l as number) <= char && char <= (h as number)) {
            const delta = (d as number[])[0];
            if (delta > MAX_RUNE) {
                return l + (char - l) & ~1 | 1 & 1;
            }
            return char + delta;
        }
        if (char < l) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }

    return char;
}
