import { simpleFold } from "@bearz/chars/simple-fold";
import { type CharBuffer, toCharSliceLike } from "./utils.ts";

/**
 * Determines if two arrays of characters are equal using a
 * case-insensitive comparison.
 * @param value The characters to check.
 * @param test The characters to compare.
 * @returns `true` if the arrays are equal; otherwise `false`.
 */
export function equalFold(value: CharBuffer, test: CharBuffer): boolean {
    const s = toCharSliceLike(value);
    const t = toCharSliceLike(test);

    if (s.length !== t.length) {
        return false;
    }

    let i = 0;

    for (; i < s.length; i++) {
        let sr = s.at(i) ?? -1;
        let tr = t.at(i) ?? -1;
        if (sr === -1 || tr === -1) {
            return false;
        }

        if ((sr | tr) >= 0x80) {
            {
                let j = i;

                for (; j < s.length; j++) {
                    let sr = s.at(j) ?? -1;
                    let tr = t.at(j) ?? -1;
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
 * Determines if two arrays of characters are equal.
 * @param value The characters to check.
 * @param test The characters to compare.
 * @returns The characters to compare.
 */
export function equal(value: CharBuffer, test: CharBuffer): boolean {
    const s = toCharSliceLike(value);
    const t = toCharSliceLike(test);

    if (s.length !== t.length) {
        return false;
    }

    let i = 0;
    for (; i < s.length; i++) {
        const sr = s.at(i) ?? -1;
        const tr = t.at(i) ?? -1;
        if (sr === -1 || tr === -1) {
            return false;
        }

        if (tr === sr) {
            continue;
        }

        return false;
    }

    return true;
}
