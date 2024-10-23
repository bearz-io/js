import { endsWith as og, endsWithFold as ogFold } from "@bearz/slices/ends-with";
import type { CharBuffer } from "@bearz/slices/utils";

export function endsWithFold(value: string, suffix: CharBuffer): boolean {
    if (suffix.length > value.length) {
        return false;
    }

    return ogFold(value, suffix);
}

export function endsWith(value: string, suffix: CharBuffer): boolean {
    if (suffix.length > value.length) {
        return false;
    }

    return og(value, suffix);
}
