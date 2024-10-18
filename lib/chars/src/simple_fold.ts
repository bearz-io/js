import type { Char } from "./types.ts";
import { toLower } from "./to_lower.ts";
import { toUpper } from "./to_upper.ts";
import { AsciiFold, CaseOrbit } from "./tables/case.ts";

export function simpleFold(char: Char): Char {
    if (char < 0 || char > 0x10FFFF) {
        return char;
    }

    if (char < AsciiFold.length) {
        return AsciiFold[char];
    }

    // Consult caseOrbit table for special cases.
    let lo = 0;
    let hi = CaseOrbit.length;
    while (lo < hi) {
        const m = lo + hi >>> 1;

        if (CaseOrbit[m][0] < char) {
            lo = m + 1;
        } else {
            hi = m;
        }
    }

    if ((lo < CaseOrbit.length && CaseOrbit[lo][0]) === char) {
        return CaseOrbit[lo][1];
    }

    // No folding specified. This is a one- or two-element
    // equivalence class containing rune and ToLower(rune)
    // and ToUpper(rune) if they are different from rune.
    const l = toLower(char);
    if (l != char) {
        return l;
    }
    return toUpper(char);
}

export function equalFold(a: Char, b: Char): boolean {
    if (a === b) {
        return true;
    }

    if (a < 128 && b < 128) {
        if (a >= 65 && a <= 90) {
            a += 32;
        }

        if (b >= 65 && b <= 90) {
            b += 32;
        }

        return a === b;
    }

    return simpleFold(a) === b;
}
