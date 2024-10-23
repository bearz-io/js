/**
 * Converts the string to a char array.
 * @param s The string to convert.
 * @returns The string as a char array.
 */
export function toCharArray(s: string): Uint32Array {
    const set = new Uint32Array(s.length);
    for (let i = 0; i < s.length; i++) {
        set[i] = s.codePointAt(i) ?? 0;
    }

    return set;
}
