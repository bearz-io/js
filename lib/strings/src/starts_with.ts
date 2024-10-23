import { startsWith as og, startsWithFold as ogFold } from "@bearz/slices/starts-with";
import type { CharBuffer } from "@bearz/slices/utils";

export function startsWith(value: string, prefix: CharBuffer): boolean {
    return og(value, prefix);
}

export function startsWithFold(value: string, prefix: CharBuffer): boolean {
    return ogFold(value, prefix);
}
