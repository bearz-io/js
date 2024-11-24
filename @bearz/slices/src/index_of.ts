import { simpleFold } from "@bearz/chars/simple-fold";
import { type CharBuffer, toCharSliceLike } from "./utils.ts";

/**
 * Gets the index of the first occurrence of the test array in the value array
 * using a case-insensitive comparison.
 * @param value The array of characters to search in.
 * @param test The aray of characters to search for.
 * @param index The index to start the search at.
 * @returns The index of the first occurrence of the test array in
 * the value array, or -1 if not found.
 */
export function indexOfFold(value: CharBuffer, test: CharBuffer, index = 0): number {
    const s = toCharSliceLike(value);
    const t = toCharSliceLike(test);

    if (t.length > s.length) {
        return -1;
    }

    let f = 0;
    let i = index;
    for (; i < s.length; i++) {
        let sr = s.at(i) ?? -1;
        let tr = t.at(f) ?? -1;

        if (sr === -1 || tr === -1) {
            f = 0;
            continue;
        }

        if ((sr | tr) >= 0x80) {
            {
                let j = i;

                for (; j < s.length; j++) {
                    let sr = s.at(j) ?? -1;
                    let tr = t.at(f) ?? -1;
                    if (sr === -1 || tr === -1) {
                        f = 0;
                        continue;
                    }

                    if (tr === sr) {
                        f++;
                        if (f === t.length) {
                            return i - t.length + 1;
                        }

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
                            f++;

                            if (f == t.length - 1) {
                                return i + 1 - f;
                            }
                            continue;
                        }

                        f = 0;
                        continue;
                    }

                    let r = simpleFold(sr);
                    while (r != sr && r < tr) {
                        r = simpleFold(r);
                    }

                    if (r == tr) {
                        f++;

                        if (f == t.length - 1) {
                            return i + 1 - f;
                        }
                        continue;
                    }

                    f = 0;
                }

                if (f == t.length - 1) {
                    return i + 1 - f;
                }

                return -1;
            }
        }

        if (tr === sr) {
            f++;

            if (f === t.length - 1) {
                return i + 1 - f;
            }

            continue;
        }

        if (tr < sr) {
            const tmp = tr;
            tr = sr;
            sr = tmp;
        }

        if (65 <= sr && sr <= 90 && tr === sr + 32) {
            f++;

            if (f === t.length - 1) {
                return i + 1 - f;
            }

            continue;
        }

        f = 0;
    }

    if (f === t.length) {
        return i - f;
    }

    return -1;
}

/**
 * Gets the index of the first occurrence of the test array in the value array.
 * @param value The array of characters to search in.
 * @param test The aray of characters to search for.
 * @param index The index to start the search at.
 * @returns The index of the first occurrence of the test array in
 * the value array, or -1 if not found.
 */
export function indexOf(value: CharBuffer, test: CharBuffer, index = 0): number {
    const s = toCharSliceLike(value);
    const t = toCharSliceLike(test);

    if (t.length > s.length) {
        return -1;
    }

    let f = 0;
    let i = index;
    for (; i < s.length; i++) {
        const sr = s.at(i) ?? -1;
        const tr = t.at(f) ?? -1;

        if (sr === -1 || tr === -1) {
            f = 0;
            continue;
        }

        if (sr === tr) {
            f++;
            if (f === t.length) {
                return i - t.length + 1;
            }

            continue;
        }

        f = 0;
    }

    if (f === t.length) {
        return i - f;
    }

    return -1;
}
