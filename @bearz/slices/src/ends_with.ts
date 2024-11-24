import { type CharBuffer, toCharSliceLike } from "./utils.ts";
import { simpleFold } from "@bearz/chars/simple-fold";

/**
 * Determines if the an array of characters ends with the given characters using
 * a case-insensitive comparison.
 * @param value The characters to check.
 * @param test The characteres to compare.
 * @returns `true` if the array ends with the given characters; otherwise `false`.
 */
export function endsWithFold(value: CharBuffer, test: CharBuffer): boolean {
    const s = toCharSliceLike(value);
    const t = toCharSliceLike(test);

    if (t.length > s.length) {
        return false;
    }

    let i = Math.min(s.length, t.length);
    for (i; i > 0; i--) {
        let sr = s.at(s.length - i) ?? -1;
        let tr = t.at(t.length - i) ?? -1;
        if (sr === -1 || tr === -1) {
            return false;
        }

        if ((sr | tr) >= 0x80) {
            {
                let j = i;

                for (; j > 0; j--) {
                    let sr = s.at(s.length - j) ?? -1;
                    let tr = t.at(t.length - j) ?? -1;
                    if (sr === -1 || tr === -1) {
                        return false;
                    }

                    if (tr === sr) {
                        continue;
                    }

                    if (tr < sr) {
                        const tmp = tr;
                        tr = sr;
                        sr = tmp;
                    }

                    // short circuit if tr is ASCII
                    if (tr < 0x80) {
                        if (65 <= sr && sr <= 90 && tr === sr + 32) {
                            continue;
                        }

                        return false;
                    }

                    let r = simpleFold(sr);
                    while (r !== sr && r < tr) {
                        r = simpleFold(r);
                    }

                    if (r === tr) {
                        continue;
                    }

                    return false;
                }

                return true;
            }
        }

        if (tr === sr) {
            continue;
        }

        if (tr < sr) {
            const tmp = tr;
            tr = sr;
            sr = tmp;
        }

        if (65 <= sr && sr <= 90 && tr === sr + 32) {
            continue;
        }

        return false;
    }

    return true;
}

/**
 * Determines if an array of characters ends with the given characters.
 * @param value The characters to check.
 * @param test The characters to compare.
 * @returns `true` if the array ends with the given characters; otherwise `false`.
 */
export function endsWith(value: CharBuffer, test: CharBuffer): boolean {
    const s = toCharSliceLike(value);
    const t = toCharSliceLike(test);

    if (t.length > s.length) {
        return false;
    }

    for (let i = 0; i < t.length; i++) {
        if (s.at(s.length - t.length + i) !== t.at(i)) {
            return false;
        }
    }

    return true;
}
