/**
 * A contract for a type that can be used as a slice of characters.
 */
export interface CharSliceLike {
    at(index: number): number | undefined;
    length: number;
}

/**
 * A contract for a type that can be used as a sequence of characters.
 */
export interface CharSequence extends CharSliceLike {
    slice(start: number, end?: number): CharSequence;
}

/**
 * A contract for a type that can be used as a buffer of characters
 * such as a string, Uint32Array, Uint16Array, Uint8Array, or CharSequence.
 */
export type CharBuffer = string | Uint32Array | Uint16Array | Uint8Array | CharSequence;

/**
 * Converts a string to a Uint32Array of characters.
 * @param s The string to convert.
 * @returns The Uint32Array of characters
 */
export function toCharArray(s: string): Uint32Array {
    const set = new Uint32Array(s.length);
    for (let i = 0; i < s.length; i++) {
        set[i] = s.codePointAt(i) ?? 0;
    }

    return set;
}

/**
 * Converts a CharBuffer to a string.
 * @param buffer The character buffer to convert.
 * @returns The string.
 */
export function toString(buffer: CharBuffer): string {
    if (typeof buffer === "string") {
        return buffer;
    }

    if (buffer instanceof Uint32Array) {
        return String.fromCodePoint(...buffer);
    }

    if (buffer instanceof Uint16Array) {
        const codePoints = new Uint32Array(buffer.buffer);
        return String.fromCodePoint(...codePoints);
    }

    if (buffer instanceof Uint8Array) {
        const codePoints = new Uint32Array(buffer.buffer);
        return String.fromCodePoint(...codePoints);
    }

    const codePoints = new Uint32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
        codePoints[i] = buffer.at(i) ?? 0;
    }

    return String.fromCodePoint(...codePoints);
}

/**
 * Converts a CharBuffer to a CharSliceLike interface.
 * @param buffer The character buffer to convert.
 * @returns The slice.
 */
export function toCharSliceLike(buffer: CharBuffer): CharSliceLike {
    if (typeof buffer === "string") {
        return {
            at(i: number): number | undefined {
                return buffer.codePointAt(i);
            },
            length: buffer.length,
        };
    }

    if (buffer instanceof Uint32Array) {
        return buffer;
    }

    if (buffer instanceof Uint16Array) {
        return new Uint32Array(buffer.buffer);
    }

    if (buffer instanceof Uint8Array) {
        return new Uint32Array(buffer.buffer);
    }

    return buffer;
}
