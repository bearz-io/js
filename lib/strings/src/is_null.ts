import { isSpaceAt } from "@bearz/chars/is-space";

export function isNull(s: string | null): s is null {
    return s === null;
}

export function isUndefined(s: string | undefined): s is undefined {
    return s === undefined;
}

export function isEmpty(s: string): s is "" {
    return s.length === 0;
}

export function isNullOrEmpty(s?: string | null): s is undefined | null | "" {
    return s === null || s === undefined || s.length === 0;
}

export function isSpace(s: string): boolean {
    for (let i = 0; i < s.length; i++) {
        if (!isSpaceAt(s, i)) {
            return false;
        }
    }

    return true;
}

export function isNullOrSpace(s?: string | null): s is null | undefined | "" {
    if (s === null || s === undefined || s.length === 0) {
        return true;
    }

    for (let i = 0; i < s.length; i++) {
        if (!isSpaceAt(s, i)) {
            return false;
        }
    }

    return true;
}
