import {
    trimChar as ogChar,
    trimEndChar as ogEndChar,
    trimEndSlice as ogEndSlice,
    trimSlice as ogSlice,
    trimStartChar as ogStartChar,
    trimStartSlice as ogStartSlice,
} from "@bearz/slices/trim";
import { type CharBuffer, toCharSliceLike } from "@bearz/slices/utils";

export function trimEndChar(value: string, suffix: number): string {
    const r = ogEndChar(value, suffix);
    return String.fromCodePoint(...r);
}

export function trimEndSlice(value: string, prefix: CharBuffer): string {
    const r = ogEndSlice(value, prefix);
    return String.fromCodePoint(...r);
}

export function trimEnd(value: string, suffix?: CharBuffer): string {
    if (suffix === undefined) {
        return value.trimEnd();
    }

    if (suffix.length === 1) {
        const t = toCharSliceLike(suffix);
        const rune = t.at(0) ?? -1;
        return trimEndChar(value, rune);
    }

    return trimEndSlice(value, suffix);
}

export function trimStartChar(value: string, suffix: number): string {
    const r = ogStartChar(value, suffix);
    return String.fromCodePoint(...r);
}

export function trimStartSlice(value: string, prefix: CharBuffer): string {
    const r = ogStartSlice(value, prefix);
    return String.fromCodePoint(...r);
}

export function trimStart(value: string, prefix?: CharBuffer): string {
    if (prefix === undefined) {
        return value.trimStart();
    }

    if (prefix.length === 1) {
        const t = toCharSliceLike(prefix);
        const rune = t.at(0) ?? -1;

        return trimStartChar(value, rune);
    }

    return trimStartSlice(value, prefix);
}

export function trimChar(value: string, char: number): string {
    const r = ogChar(value, char);
    return String.fromCodePoint(...r);
}

export function trimSlice(value: string, chars: CharBuffer): string {
    const r = ogSlice(value, chars);
    return String.fromCodePoint(...r);
}

export function trim(value: string, chars?: CharBuffer): string {
    if (chars === undefined) {
        return value.trim();
    }

    if (chars.length === 1) {
        const t = toCharSliceLike(chars);
        const rune = t.at(0) ?? -1;

        return trimChar(value, rune);
    }

    return trimSlice(value, chars);
}
