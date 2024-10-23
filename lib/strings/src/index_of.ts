import { indexOf as og, indexOfFold as ogFold } from "@bearz/slices/index-of";
import type { CharBuffer } from "@bearz/slices/utils";

export function indexOfFold(value: string, chars: CharBuffer, index = 0): number {
    return ogFold(value, chars, index);
}

export function indexOf(value: string, chars: CharBuffer, index = 0): number {
    return og(value, chars, index);
}
