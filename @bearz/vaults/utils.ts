import { isDigit, isLetter, isLower, isSpace, isUpper, toLower, toUpper } from "@bearz/chars";
import {
    CHAR_COLON,
    CHAR_FORWARD_SLASH,
    CHAR_HYPHEN_MINUS,
    CHAR_UNDERSCORE,
} from "@bearz/chars/constants";
import { CharArrayBuilder } from "@bearz/slices";
import { coerceError, fail, type Result } from "@bearz/functional";
import { NotFoundError } from "@bearz/errors/not-found";
import { AbortError } from "../errors/abort_error.ts";

/**
 * Determines if the result is an error and the error is a not found error.
 * @param res The result to check.
 * @returns `true` if the result is an error and the error is a not found error, otherwise `false`.
 */
export function notFound<T = unknown>(res: Result<T>) {
    return res.isError && NotFoundError.is(res.unwrapError())
}

export function abort(signal: AbortSignal) : Result<never> {
    if (signal.reason) 
        return coerceError(signal.reason);

    return fail(new AbortError());
}

/**
 * Options for normalizing a key.
 */
export interface NormalizeKeyOptions {
    /**
     * Determines if the key should be normalized to screaming snake case.
     */
    screaming?: boolean;

    /**
     * Determines if the case of the key should be preserved.
     */
    preserveCase?: boolean;

    /**
     * The character to use for normalization. If not provided, the default is color (':')
     * if screaming is true and the value is not provided, then the default is underscore ('_').
     */
    char?: number;
}

/**
 * Normalizes a key to a specific format to ensure consistency or requirements for the
 * secret name/key of a given vault.
 * @param key The key to normalize.
 * @param options The options to use when normalizing the key.
 * @returns The normalized key.
 */
export function normalizeKey(key: string, options?: NormalizeKeyOptions): string {
    options ??= {};
    options.char ??= options.screaming ? CHAR_UNDERSCORE : CHAR_COLON;

    const char = options.char;

    if (
        char !== CHAR_UNDERSCORE && char !== CHAR_HYPHEN_MINUS && char !== CHAR_COLON &&
        char !== CHAR_FORWARD_SLASH
    ) {
        throw new Error(
            "Invalid character for normalization. Separator char must be one of the following: '_', '-', ':', or '/'.",
        );
    }

    if (options.preserveCase && options.screaming) {
        throw new Error("Cannot specify both preserveCase and screaming.");
    }

    const sb = new CharArrayBuilder();
    let last = 0;

    for (let i = 0; i < key.length; i++) {
        const c = key.codePointAt(i) ?? -1;
        if (c === -1) {
            continue;
        }

        if (isLetter(c)) {
            if (isUpper(c)) {
                if (isLetter(last) && isLower(last)) {
                    sb.appendChar(CHAR_UNDERSCORE);

                    if (options.preserveCase || options.screaming) {
                        sb.appendChar(c);
                        last = c;
                        continue;
                    }

                    sb.appendChar(toLower(c));
                    last = c;
                    continue;
                }

                if (options.preserveCase || options.screaming) {
                    sb.appendChar(c);
                    last = c;
                    continue;
                }

                sb.appendChar(toLower(c));
                last = c;
                continue;
            }

            if (options.screaming) {
                sb.appendChar(toUpper(c));
            } else if (options.preserveCase) {
                sb.appendChar(c);
            } else {
                sb.appendChar(toLower(c));
            }

            last = c;
            continue;
        }

        if (isDigit(c)) {
            last = c;
            sb.appendChar(c);
        }

        if (
            c === char || c === CHAR_UNDERSCORE || c === CHAR_HYPHEN_MINUS || c === CHAR_COLON ||
            c === CHAR_FORWARD_SLASH || isSpace(c)
        ) {
            if (sb.length === 0) {
                continue;
            }

            if (last === char) {
                continue;
            }

            sb.appendChar(char);
            last = char;
            continue;
        }
    }
    const r = sb.toString();
    sb.clear();
    return r;
}
