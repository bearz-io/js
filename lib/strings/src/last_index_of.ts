import { lastIndexOf as og, lastIndexOfFold as ogFold } from "@bearz/slices/last-index-of";
import type { CharBuffer } from "@bearz/slices/utils";

export function lastIndexOf(value: string, chars: CharBuffer, index = 0): number {
    return og(value, chars, index);
}

export function lastIndexOfFold(value: string, chars: CharBuffer, index = 0): number {
    return ogFold(value, chars, index);
}
