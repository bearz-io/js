import { equal as og, equalFold as ogFold } from "@bearz/slices/equal";
import type { CharBuffer } from "@bearz/slices/utils";

export function equal(value: string, other: CharBuffer): boolean {
    return og(value, other);
}

/**
 * equalFold reports whether s and t, interpreted as UTF-8 strings, are equal under Unicode case-folding.
 *
 * @param value
 * @param other
 */
export function equalFold(value: string, other: CharBuffer): boolean {
    if (value.length !== other.length) {
        return false;
    }

    return ogFold(value, other);
}
