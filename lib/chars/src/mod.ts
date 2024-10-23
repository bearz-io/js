/**
 * ## Overview
 *
 * The chars module contains character related functions commonly
 * found in other standard libraries or frameworks such as `isSpace`,
 * `isLetter`, `isUpper`, `isDigit`, etc.
 *
 * The module will handle characters outside latin and ascii such as
 * Cyrillic or Greek characters.
 *
 * The char module provides functions common character functions:
 *
 * - `equalFold`
 * - `isAscii`
 * - `isChar`
 * - `isControl`
 * - `isDigit`
 * - `isLatin`
 * - `isLetterOrDigit`
 * - `isLetter`
 * - `isLower`
 * - `isPunc`
 * - `isSpace`
 * - `isSymbol`
 * - `isUpper`
 * - `simpleFold`
 * - `toLower`
 * - `toUpper`
 *
 * ## Basic Usage
 *
 * ```typescript
 * import {
 *     isUpperAt,
 *     isLowerAt,
 *     isDigit,
 *     isAscii,
 *     isLatin1,
 *     isSpaceAt,
 *     equalFold
 * } from "@bearz/chars";
 *
 * const str = "Hello, World 123";
 * console.log(isUpperAt(str, 0)); // true
 * console.log(isUpperAt(str, 1)); // false
 * console.log(isLowerAt(str, 1)); // false
 * console.log(isDigit(str, 1)); // false
 * console.log(isDigit(str, 14)); // true
 *
 * const left = "Ꙏ".codePointAt(0)
 * const right = "ꙏ".codePointAt(0)
 * console.log(equalFold(left, right)); // true
 *
 * console.log(isAsciiAt("⇼", 0)); // false
 * console.log(isAsciiAt(str, 0)); // true
 * console.log(isLatin1At("⇼", 0)); // false
 *
 * const str2 = " \n\r\t\f"
 * console.log(isSpaceAt(str2, 0)); // true
 * console.log(isSpaceAt(str2, 1)); // true
 * console.log(isSpaceAt(str2, 2)); // true
 * console.log(isSpaceAt(str2, 3)); // true
 * ```
 *
 * ## Notes
 *
 * The overall goal for the char module to enable inspecting
 * characters and avoid string allocations where possible.
 *
 * ## License
 *
 * [MIT License](./LICENSE.md) and the BSD style License
 * from [go](https://go.dev/LICENSE) as the updated version
 * of this library is adapted from go's unicode package.
 */
import { isAscii } from "./is_ascii.ts";
import { isChar } from "./is_char.ts";
import { isControl } from "./is_control.ts";
import { isDigit } from "./is_digit.ts";
import { isLatin1 } from "./is_latin1.ts";
import { isLetter } from "./is_letter.ts";
import { isLetterOrDigit } from "./is_letter_or_digit.ts";
import { isLower } from "./is_lower.ts";
import { isPunc } from "./is_punc.ts";
import { isSpace } from "./is_space.ts";
import { isSymbol } from "./is_symbol.ts";
import { isUpper } from "./is_upper.ts";
import { equalFold, simpleFold } from "./simple_fold.ts";
import { toLower } from "./to_lower.ts";
import { toUpper } from "./to_upper.ts";
export * from "./types.ts";

export {
    equalFold,
    isAscii,
    isChar,
    isControl,
    isDigit,
    isLatin1,
    isLetter,
    isLetterOrDigit,
    isLower,
    isPunc,
    isSpace,
    isSymbol,
    isUpper,
    simpleFold,
    toLower,
    toUpper,
};

export default {
    equalFold,
    isAscii,
    isChar,
    isControl,
    isDigit,
    isLatin1,
    isLetter,
    isLetterOrDigit,
    isLower,
    isPunc,
    isSpace,
    isSymbol,
    simpleFold,
    toLower,
    toUpper,
};
