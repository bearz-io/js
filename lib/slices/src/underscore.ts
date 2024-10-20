import { CharArrayBuilder } from "./char_array_builder.ts";
import { CHAR_HYPHEN_MINUS, CHAR_UNDERSCORE } from "@bearz/chars/constants";
import { isDigit, isLetter, isLower, isSpace, isUpper, toLower, toUpper } from "@bearz/chars";
import { type CharBuffer, toCharSliceLike } from "./utils.ts";

/**
 * UnderScoreOptions is the options for the underscore function.
 * @property screaming - If true, the first character will be uppercased.
 * @property preserveCase - If true, the case of the first character will be preserved.
 */
export interface UnderScoreOptions {
    /**
     * If true, all characters will be converted to uppercase.
     * If false, all characters will be converted to lowercase.
     */
    screaming?: boolean;
    /**
     * If true, the case of the first character will be preserved.
     */
    preserveCase?: boolean;
}

/**
 * Converts the slice to the the underscore case. The `_`, `-`, ` `
 * characters are converted to `-` and prepending a `-` to any uppercase
 * character unless the preserveCase option is set to true
 * or the screaming option is set to true, or it is the first character.
 *
 * Underscore is primary for camel or pascal case strings.
 *
 * @param slice The string to underscore.
 * @param options The options for the function.
 * @returns A char array that is in the underscore case.
 * @throws Error if preserveCase and screaming are both true.
 */
export function underscore(slice: CharBuffer, options?: UnderScoreOptions): Uint32Array {
    options ??= {};

    if (options.preserveCase && options.screaming) {
        throw new Error("preserveCase and screaming cannot be used together");
    }

    const v = toCharSliceLike(slice);

    const sb = new CharArrayBuilder();
    let last = 0;

    for (let i = 0; i < v.length; i++) {
        const c = v.at(i) ?? -1;
        if (c === -1) {
            continue;
        }

        if (isLetter(c)) {
            if (isUpper(c)) {
                if (isLetter(last) && isLower(last)) {
                    sb.appendChar(CHAR_UNDERSCORE);

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

            if (last === CHAR_UNDERSCORE) {
                continue;
            }

            sb.appendChar(CHAR_UNDERSCORE);
            last = CHAR_UNDERSCORE;
            continue;
        }
    }
    const r = sb.toArray();
    sb.clear();
    return r;
}
