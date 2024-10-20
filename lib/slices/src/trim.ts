import { isSpace } from "@bearz/chars/is-space";
import { type CharBuffer, toCharSliceLike } from "./utils.ts";

export function trimEndSpace(value: CharBuffer): Uint32Array {
    const s = toCharSliceLike(value);
    let size = s.length;

    for (let i = s.length - 1; i >= 0; i--) {
        const c = s.at(i) ?? -1;
        if (isSpace(c)) {
            size--;
        } else {
            break;
        }
    }

    const buffer = new Uint32Array(size);
    if (s instanceof Uint32Array) {
        buffer.set(s);
        return buffer;
    }

    for (let i = 0; i < size; i++) {
        buffer[i] = s.at(i) ?? 0;
    }

    return buffer;
}

export function trimEndChar(value: CharBuffer, suffix: number): Uint32Array {
    const s = toCharSliceLike(value);

    let size = s.length;

    for (let i = s.length - 1; i >= 0; i--) {
        if (s.at(i) === suffix) {
            size--;
        } else {
            break;
        }
    }

    if (size === s.length && s instanceof Uint32Array) {
        return s;
    }

    const buffer = new Uint32Array(size);
    if (s instanceof Uint32Array) {
        buffer.set(s);
        return buffer;
    }

    for (let i = 0; i < size; i++) {
        buffer[i] = s.at(i) ?? 0;
    }

    return buffer;
}

export function trimEndSlice(value: CharBuffer, suffix: CharBuffer): Uint32Array {
    const s = toCharSliceLike(value);
    const t = toCharSliceLike(suffix);
    let size = s.length;

    for (let i = s.length - 1; i >= 0; i--) {
        let match = false;
        for (let j = 0; j < t.length; j++) {
            if (s.at(i) === t.at(j)) {
                size--;
                match = true;
                break;
            }
        }

        if (!match) {
            break;
        }
    }

    if (size === s.length && s instanceof Uint32Array) {
        return s;
    }

    const buffer = new Uint32Array(size);
    if (s instanceof Uint32Array) {
        buffer.set(s);
        return buffer;
    }

    for (let i = 0; i < size; i++) {
        buffer[i] = s.at(i) ?? 0;
    }

    return buffer;
}

export function trimEnd(value: CharBuffer, suffix?: CharBuffer): Uint32Array {
    if (suffix === undefined) {
        return trimEndSpace(value);
    }

    if (suffix.length === 1) {
        const t = toCharSliceLike(suffix);
        const rune = t.at(0) ?? -1;
        return trimEndChar(value, rune);
    }

    return trimEndSlice(value, suffix);
}

export function trimStartSpace(value: CharBuffer): Uint32Array {
    const s = toCharSliceLike(value);
    let size = s.length;

    for (let i = 0; i < s.length; i++) {
        if (isSpace(s.at(i) ?? -1)) {
            size--;
        } else {
            break;
        }
    }

    if (size === s.length && s instanceof Uint32Array) {
        return s;
    }

    const buffer = new Uint32Array(size);
    if (s instanceof Uint32Array) {
        buffer.set(s);
        return buffer;
    }

    for (let i = 0; i < size; i++) {
        buffer[i] = s.at(i) ?? 0;
    }

    return buffer;
}

export function trimStartChar(value: CharBuffer, prefix: number): Uint32Array {
    if (!Number.isInteger(prefix) || prefix < 0 || prefix > 0x10FFFF) {
        throw new RangeError("Invalid code point");
    }

    const s = toCharSliceLike(value);
    let size = s.length;

    for (let i = 0; i < s.length; i++) {
        if (s.at(i) === prefix) {
            size--;
        } else {
            break;
        }
    }

    if (size === s.length && s instanceof Uint32Array) {
        return s;
    }

    const buffer = new Uint32Array(size);
    if (s instanceof Uint32Array) {
        buffer.set(s);
        return buffer;
    }

    for (let i = 0; i < size; i++) {
        buffer[i] = s.at(i) ?? 0;
    }

    return buffer;
}

export function trimStartSlice(value: CharBuffer, prefix: CharBuffer): Uint32Array {
    const s = toCharSliceLike(value);
    const t = toCharSliceLike(prefix);

    let size = s.length;
    let j = 0;

    for (j = 0; j < s.length; j++) {
        let match = false;
        const c = s.at(j) ?? -1;
        for (let i = 0; i < t.length; i++) {
            if (c === t.at(i)) {
                size--;
                match = true;
                break;
            }
        }

        if (!match) {
            break;
        }
    }

    if (size === s.length && s instanceof Uint32Array) {
        return s;
    }

    const buffer = new Uint32Array(size);
    if (s instanceof Uint32Array) {
        buffer.set(s.slice(j));
        return buffer;
    }

    for (let i = 0; i < size; i++) {
        buffer[i] = s.at(i + j) ?? 0;
    }

    return buffer;
}

export function trimStart(s: CharBuffer, prefix?: CharBuffer): Uint32Array {
    if (prefix === undefined) {
        return trimStartSpace(s);
    }

    if (prefix.length === 1) {
        const t = toCharSliceLike(prefix);
        const rune = t.at(0) ?? -1;

        trimStartChar(s, rune);
    }

    return trimStartSlice(s, prefix);
}

export function trimSpace(value: CharBuffer): Uint32Array {
    const s = toCharSliceLike(value);

    let start = 0;
    let end = s.length;

    for (let i = 0; i < s.length; i++) {
        if (isSpace(s.at(i) ?? -1)) {
            start++;
        } else {
            break;
        }
    }

    if (start === s.length) {
        return new Uint32Array(0);
    }

    for (let i = s.length - 1; i >= 0; i--) {
        if (isSpace(s.at(i) ?? -1)) {
            end--;
        } else {
            break;
        }
    }

    if (start === 0 && end === s.length && s instanceof Uint32Array) {
        return s;
    }

    const buffer = new Uint32Array(end - start);
    if (s instanceof Uint32Array) {
        buffer.set(s.subarray(start, end));
        return buffer;
    }

    for (let i = start; i < end; i++) {
        buffer[i - start] = s.at(i) ?? 0;
    }

    return buffer;
}

export function trimChar(value: CharBuffer, prefix: number): Uint32Array {
    if (!Number.isInteger(prefix) || prefix < 0 || prefix > 0x10FFFF) {
        throw new RangeError("Invalid code point");
    }

    const s = toCharSliceLike(value);
    let start = 0;
    let end = s.length;

    for (let i = 0; i < s.length; i++) {
        if (s.at(i) === prefix) {
            start++;
        } else {
            break;
        }
    }

    if (start === s.length) {
        return new Uint32Array(0);
    }

    for (let i = s.length - 1; i >= 0; i--) {
        if (s.at(i) === prefix) {
            end--;
        } else {
            break;
        }
    }

    if (start === 0 && end === s.length && s instanceof Uint32Array) {
        return s;
    }

    const buffer = new Uint32Array(end - start);
    if (s instanceof Uint32Array) {
        buffer.set(s.subarray(start, end));
        return buffer;
    }

    for (let i = start; i < end; i++) {
        buffer[i - start] = s.at(i) ?? 0;
    }

    return buffer;
}

export function trimSlice(value: CharBuffer, chars: CharBuffer): Uint32Array {
    const s = toCharSliceLike(value);
    const t = toCharSliceLike(chars);

    let start = 0;
    let end = s.length;

    for (let i = 0; i < s.length; i++) {
        let match = false;
        for (let j = 0; j < t.length; j++) {
            if (s.at(i) === t.at(j)) {
                start++;
                match = true;
                break;
            }
        }

        if (!match) {
            break;
        }
    }

    if (start === s.length) {
        return new Uint32Array(0);
    }

    for (let i = s.length - 1; i >= 0; i--) {
        let match = false;
        for (let j = 0; j < t.length; j++) {
            if (s.at(i) === t.at(j)) {
                end--;
                match = true;
                break;
            }
        }

        if (!match) {
            break;
        }
    }

    if (start === 0 && end === s.length && s instanceof Uint32Array) {
        return s;
    }

    const buffer = new Uint32Array(end - start);
    if (s instanceof Uint32Array) {
        buffer.set(s.subarray(start, end));
        return buffer;
    }

    for (let i = start; i < end; i++) {
        buffer[i - start] = s.at(i) ?? 0;
    }

    return buffer;
}

export function trim(value: CharBuffer, chars?: CharBuffer): Uint32Array {
    if (chars === undefined) {
        return trimSpace(value);
    }

    if (chars.length === 1) {
        const t = toCharSliceLike(chars);
        const rune = t.at(0) ?? -1;
        return trimChar(value, rune);
    }

    return trimSlice(value, chars);
}
