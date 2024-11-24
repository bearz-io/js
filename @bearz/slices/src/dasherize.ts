import { CharArrayBuilder } from "./char_array_builder.ts";
import { CHAR_HYPHEN_MINUS, CHAR_UNDERSCORE } from "@bearz/chars/constants";
import { isDigit } from "@bearz/chars/is-digit";
import { isLetter } from "@bearz/chars/is-letter";
import { isLower } from "@bearz/chars/is-lower";
import { isSpace } from "@bearz/chars/is-space";
import { isUpper } from "@bearz/chars/is-upper";
import { toLower } from "@bearz/chars/to-lower";
import { toUpper } from "@bearz/chars/to-upper";
import { type CharBuffer, toCharSliceLike } from "./utils.ts";

/**
 * DasherizeOptions is the options for the dasherize function.
 * @property screaming - If true, the first character will be uppercased.
 * @property preserveCase - If true, the case of the first character will be preserved.
 */
export interface DasherizeOptions {
    screaming?: boolean;
    preserveCase?: boolean;
}

/**
 * Dasherize converts a string to kebab case, converting any `_`, `-`, ` ` to `-` and
 * prepending a `-` to any uppercase character unless the preserveCase option is set to true
 * or the screaming option is set to true, or it is the first character.
 *
 * Dasherize is primary for camel or pascal case strings.
 *
 * @param value The string to convert to dasherized case.
 * @param options The options for the function.
 * @returns The dasherized string as a Uint32Array.
 */
export function dasherize(value: CharBuffer, options?: DasherizeOptions): Uint32Array {
    const v = toCharSliceLike(value);

    options ??= {};
    if (options.preserveCase && options.screaming) {
        throw new Error("preserveCase and screaming cannot be used together");
    }

    const sb = new CharArrayBuilder();
    let last = 0;

    for (let i = 0; i < value.length; i++) {
        const c = v.at(i) ?? -1;
        if (c === -1) {
            continue;
        }

        if (isLetter(c)) {
            if (isUpper(c)) {
                if (isLetter(last) && isLower(last)) {
                    sb.appendChar(CHAR_HYPHEN_MINUS);

                    if (options.preserveCase || options.screaming) {
                        sb.appendChar(c);
                        last = c;
                        continue;
                    }

                    sb.appendChar(toLower(c));
                    last = c;
                    continue;
                }

                if (options.preserveCase || options.screaming) {
                    sb.appendChar(c);
                    last = c;
                    continue;
                }

                sb.appendChar(toLower(c));
                last = c;
                continue;
            }

            if (options.screaming) {
                sb.appendChar(toUpper(c));
            } else if (options.preserveCase) {
                sb.appendChar(c);
            } else {
                sb.appendChar(toLower(c));
            }

            last = c;
            continue;
        }

        if (isDigit(c)) {
            last = c;
            sb.appendChar(c);
        }

        if (c === CHAR_UNDERSCORE || c === CHAR_HYPHEN_MINUS || isSpace(c)) {
            if (sb.length === 0) {
                continue;
            }

            if (last === CHAR_HYPHEN_MINUS) {
                continue;
            }

            sb.appendChar(CHAR_HYPHEN_MINUS);
            last = CHAR_HYPHEN_MINUS;
            continue;
        }
    }
    const r = sb.toArray();
    sb.clear();
    return r;
}
