export function toCharArray(s: string): Uint32Array {
    const set = new Uint32Array(s.length);
    for (let i = 0; i < s.length; i++) {
        set[i] = s.codePointAt(i) ?? 0;
    }

    return set;
}
