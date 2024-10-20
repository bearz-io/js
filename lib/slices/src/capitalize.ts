import { type CharBuffer, toCharSliceLike } from "./utils.ts";
import { toLower } from "@bearz/chars/to-lower";
import { toUpper } from "@bearz/chars/to-upper";

/**
 * Options for the capitalize function.
 */
export interface CapitalizeOptions {
    /**
     * Preserve the case of the characters that are not
     * the first character.
     */
    preserveCase?: boolean;
}

/**
 * Capitalize converts the first character of a string to uppercase. By default, it
 * converts the first character to uppercase and the rest to lowercase.
 *
 * @description
 * To avoid allocations, the function returns a Uint32Array that represents
 * the capitalized string.  To convert the Uint32Array to a string, use
 * `String.fromCharCode(...capitalized)`.
 *
 * @param value The string to capitalize.
 * @param options The options for the function.
 * @returns The capitalized string as a Uint32Array.
 * @example
 * ```typescript
 * import { capitalize } from '@bearz/slices/capitalize';
 *
 * const capitalized = capitalize("hello world");
 * console.log(String.fromCodePoint(...capitalized)); // Output: "Hello world"
 * ```
 */
export function capitalize(value: CharBuffer, options?: CapitalizeOptions): Uint32Array {
    const v = toCharSliceLike(value);

    options ??= {};

    const buffer = new Uint32Array(v.length);
    if (v instanceof Uint32Array) {
        buffer.set(v);
        buffer[0] = toUpper(buffer[0]);
        return buffer;
    }

    for (let i = 0; i < value.length; i++) {
        const r = v.at(i);
        if (r === undefined) {
            buffer[i] = 0;
            continue;
        }
        if (i === 0) {
            buffer[i] = toUpper(r);
            continue;
        }

        if (options.preserveCase) {
            buffer[i] = r;
            continue;
        }

        buffer[i] = toLower(r);
    }

    return buffer;
}
