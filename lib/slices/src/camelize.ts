import { CharArrayBuilder } from "./char_array_builder.ts";
import { CHAR_HYPHEN_MINUS, CHAR_UNDERSCORE } from "@bearz/chars/constants";
import { isDigit } from "@bearz/chars/is-digit";
import { isLetter } from "@bearz/chars/is-letter";
import { isSpace } from "@bearz/chars/is-space";
import { toLower } from "@bearz/chars/to-lower";
import { toUpper } from "@bearz/chars/to-upper";
import { type CharBuffer, toCharSliceLike } from "./utils.ts";

/**
 * Options for the `camelize` function.
 */
export interface CamelizeOptions {
    /**
     * Preserve the case of the characters that are not
     * the first character or after a `_`, `-`, or ` `.
     */
    preserveCase?: boolean;
}

/**
 * Camelize converts a string to camel case, removing any `_`, `-`, or ` ` characters
 * and capitalizing the first letter of each word.
 *
 * @description
 * This function is
 * primary for converting snake_case, kebab-case, or space separated
 * symbols to camel case.
 *
 * To avoid allocations, the function returns a Uint32Array that represents
 * the camel case string.  To convert the Uint32Array to a string, use
 * `String.fromCharCode(...camel)`.
 *
 * @param value  The string to convert to camel case.
 * @param options The options for the function.
 * @returns The camel case string as a Uint32Array.
 *
 * @example
 * ```typescript
 * import { camelize } from '@bearz/slices/camelize';
 *
 * const camel = camelize("hello_world");
 * console.log(String.fromCharCode(...camel)); // Output: "HelloWorld"
 * ```
 */
export function camelize(value: CharBuffer | string, options?: CamelizeOptions): Uint32Array {
    options ??= {};
    const v = toCharSliceLike(value);

    const sb = new CharArrayBuilder();

    let last = 0;
    for (let i = 0; i < value.length; i++) {
        const c = v.at(i) ?? -1;
        if (c === -1) {
            continue;
        }

        if (i === 0 && isLetter(c)) {
            sb.appendChar(toUpper(c));
            last = c;
            continue;
        }

        if (isLetter(c)) {
            if (last === CHAR_UNDERSCORE) {
                sb.appendChar(toUpper(c));
                last = c;
                continue;
            }

            if (options.preserveCase) {
                sb.appendChar(c);
                last = c;
                continue;
            }
            sb.appendChar(toLower(c));
            last = c;
            continue;
        }

        if (c === CHAR_HYPHEN_MINUS || c === CHAR_UNDERSCORE || isSpace(c)) {
            last = CHAR_UNDERSCORE;
            continue;
        }

        if (isDigit(c)) {
            last = c;
            sb.appendChar(c);
            continue;
        }

        sb.appendChar(c);
        last = c;
    }

    const r = sb.toArray();
    sb.clear();
    return r;
}
