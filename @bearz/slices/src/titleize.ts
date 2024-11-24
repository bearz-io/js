import { CHAR_SPACE, CHAR_UNDERSCORE } from "@bearz/chars/constants";
import { isLetter } from "@bearz/chars/is-letter";
import { isLetterOrDigit } from "@bearz/chars/is-letter-or-digit";
import { isLower } from "@bearz/chars/is-lower";
import { isSpace } from "@bearz/chars/is-space";
import { isUpper } from "@bearz/chars/is-upper";
import { toLower } from "@bearz/chars/to-lower";
import { toUpper } from "@bearz/chars/to-upper";
import { CharArrayBuilder } from "./char_array_builder.ts";
import { equalFold } from "./equal.ts";
import { Tokens } from "./tokens.ts";
import { type CharSliceLike, toCharSliceLike } from "./utils.ts";

/**
 * @description This is a list of words that should not be capitalized for title case.
 */
export const NoCapitalizeWords: Tokens = new Tokens();
[
    "and",
    "or",
    "nor",
    "a",
    "an",
    "the",
    "so",
    "but",
    "to",
    "of",
    "at",
    "by",
    "from",
    "into",
    "on",
    "onto",
    "off",
    "out",
    "in",
    "over",
    "with",
    "for",
].forEach((o) => NoCapitalizeWords.addString(o));

/**
 * Converts a an array of characters to title case.
 *
 * This function converts the first character of a string to uppercase and the rest to lowercase.
 *
 * To avoid allocations, the function returns a Uint32Array that represents
 * the title case string.  To convert the Uint32Array to a string, use
 * see {@linkcode String.fromCharCode} or {@linkcode toCharSliceLike}.
 *
 * @param s The string to convert to title case.
 * @returns A new `Uint32Array` with the title case string.
 */
export function titleize(s: CharSliceLike | string): Uint32Array {
    if (typeof s === "string") {
        s = toCharSliceLike(s);
    }

    const sb = new CharArrayBuilder();
    let last = 0;
    const tokens = new Array<Uint32Array>();

    for (let i = 0; i < s.length; i++) {
        const c = s.at(i) ?? -1;
        if (c === -1) {
            continue;
        }

        if (isLetterOrDigit(c)) {
            if (isUpper(c)) {
                if (isLetter(last) && isLower(last)) {
                    tokens.push(sb.toArray());
                    sb.clear();

                    sb.appendChar(c);
                    last = c;
                    continue;
                }
            }

            sb.appendChar(toLower(c));
            last = c;
            continue;
        }

        if (c === CHAR_UNDERSCORE || isSpace(c)) {
            if (sb.length === 0) {
                continue;
            }

            if (last === CHAR_UNDERSCORE) {
                continue;
            }

            tokens.push(sb.toArray());
            sb.clear();

            last = c;
            continue;
        }
    }

    if (sb.length > 0) {
        tokens.push(sb.toArray());
        sb.clear();
    }

    for (const token of tokens) {
        let skip = false;
        for (const title of NoCapitalizeWords) {
            if (equalFold(title, token)) {
                if (sb.length > 0) {
                    sb.appendChar(CHAR_SPACE);
                }

                sb.appendCharArray(title); // already lower case.
                skip = true;
                break;
            }
        }

        if (skip) {
            continue;
        }

        const first = toUpper(token[0]);
        token[0] = first;

        if (sb.length > 0) {
            sb.appendChar(CHAR_SPACE);
        }

        sb.appendCharArray(token);
    }

    const v = sb.toArray();
    sb.clear();
    return v;
}
