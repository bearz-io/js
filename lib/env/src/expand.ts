import { StringBuilder } from "@bearz/strings/string-builder";
import { CHAR_BACKWARD_SLASH, CHAR_PERCENT, CHAR_UNDERSCORE } from "@bearz/chars/constants";
import type { SubstitutionOptions } from "./types.ts";

export type { SubstitutionOptions } from "./types.ts";

enum TokenKind {
    None,
    Windows,
    BashVariable,
    BashInterpolation,
}

const dollar = 36;
const openBrace = 123;
const closeBrace = 125;
const percent = CHAR_PERCENT;
const min = 0;
const backslash = CHAR_BACKWARD_SLASH;

function isLetterOrDigit(c: number): boolean {
    return (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || (c >= 48 && c <= 57);
}

function isValidBashVariable(value: string) {
    for (let i = 0; i < value.length; i++) {
        const c = value.charCodeAt(i);

        if (i == 0 && !((c >= 65 && c <= 90) || (c >= 97 && c <= 122))) {
            return false;
        }

        if (!isLetterOrDigit(c) && c != 95) {
            return false;
        }
    }

    return true;
}

/**
 * Expands variables in a string using bash or windows style expansion.
 * @param template The template to expand.
 * @param get The function to get the value of a variable.
 * @param set The function to set the value of a variable.
 * @param options The substitution options for the expansion.
 * @returns The string with the expanded variables.
 */
export function expand(
    template: string,
    get: (key: string) => string | undefined,
    set: (key: string, value: string) => void,
    options?: SubstitutionOptions,
): string {
    if (typeof template !== "string" || template.length === 0) {
        return "";
    }

    const o = options ?? {};
    o.unixExpansion ??= true;
    o.unixCustomErrorMessage ??= true;
    o.unixAssignment ??= true;
    const getValue = o.getVariable ?? ((name: string) => get(name));
    const setValue = o.setVariable ??
        ((name: string, value: string) => set(name, value));
    const tokenBuilder = new StringBuilder();
    const output = new StringBuilder();
    let kind = TokenKind.None;
    let remaining = template.length;
    for (let i = 0; i < template.length; i++) {
        remaining--;
        const c = template.charCodeAt(i);
        if (kind === TokenKind.None) {
            if (o.windowsExpansion && c === percent) {
                kind = TokenKind.Windows;
                continue;
            }

            if (o.unixExpansion) {
                const z = i + 1;
                let next = min;
                if (z < template.length) {
                    next = template.charCodeAt(z);
                }

                // escape the $ character.
                if (c === backslash && next === dollar) {
                    output.appendChar(dollar);
                    i++;
                    continue;
                }

                if (c === dollar) {
                    // can't be a variable if there is no next character.

                    if (next === openBrace && remaining > 3) {
                        kind = TokenKind.BashInterpolation;
                        i++;
                        remaining--;
                        continue;
                    }

                    // only a variable if the next character is a letter.
                    if (remaining > 0 && isLetterOrDigit(next)) {
                        kind = TokenKind.BashVariable;
                        continue;
                    }
                }
            }

            output.appendChar(c);
            continue;
        }

        if (kind === TokenKind.Windows && c === percent) {
            if (tokenBuilder.length === 0) {
                // consecutive %, so just append both characters to match windows.
                output.appendChar(percent).appendChar(percent);
                continue;
            }

            const key = tokenBuilder.toString();
            const value = getValue(key);
            if (value !== undefined && value.length > 0) {
                output.appendString(value);
            }
            tokenBuilder.clear();
            kind = TokenKind.None;
            continue;
        }

        if (kind === TokenKind.BashInterpolation && c === closeBrace) {
            if (tokenBuilder.length === 0) {
                // with bash '${}' is a bad substitution.
                throw new Error(
                    "${} is a bad substitution. Variable name not provided.",
                );
            }

            const substitution = tokenBuilder.toString();
            tokenBuilder.clear();
            let key = substitution;
            let defaultValue = "";
            let message: string | undefined = undefined;
            if (substitution.includes(":-")) {
                const parts = substitution.split(":-");
                key = parts[0];
                defaultValue = parts[1];
            } else if (substitution.includes(":=")) {
                const parts = substitution.split(":=");
                key = parts[0];
                defaultValue = parts[1];

                if (o.unixAssignment) {
                    const v = getValue(key);
                    if (v === undefined) {
                        setValue(key, defaultValue);
                    }
                }
            } else if (substitution.includes(":?")) {
                const parts = substitution.split(":?");
                key = parts[0];
                if (o.unixCustomErrorMessage) {
                    message = parts[1];
                }
            } else if (substitution.includes(":")) {
                const parts = substitution.split(":");
                key = parts[0];
                defaultValue = parts[1];
            }

            if (key.length === 0) {
                throw new Error("Bad substitution, empty variable name.");
            }

            if (!isValidBashVariable(key)) {
                throw new Error(`Bad substitution, invalid variable name ${key}.`);
            }

            const value = getValue(key);
            if (value !== undefined) {
                output.appendString(value);
            } else if (message !== undefined) {
                throw new Error(message);
            } else if (defaultValue.length > 0) {
                output.appendString(defaultValue);
            } else {
                throw new Error(`Bad substitution, variable ${key} is not set.`);
            }

            kind = TokenKind.None;
            continue;
        }

        if (
            kind === TokenKind.BashVariable &&
            (!(isLetterOrDigit(c) || c === CHAR_UNDERSCORE) || remaining === 0)
        ) {
            // '\' is used to escape the next character, so don't append it.
            // its used to escape a name like $HOME\\_TEST where _TEST is not
            // part of the variable name.
            let append = c !== backslash;

            if (remaining === 0 && isLetterOrDigit(c)) {
                append = false;
                tokenBuilder.appendChar(c);
            }

            // rewind one character. Let the previous block handle $ for the next variable
            if (c === dollar) {
                append = false;
                i--;
            }

            const key = tokenBuilder.toString();
            tokenBuilder.clear();
            if (key.length === 0) {
                throw new Error("Bad substitution, empty variable name.");
            }

            const index = parseInt(key);
            if (o.unixArgsExpansion && !isNaN(index)) {
                if (index > -1 || index < Deno.args.length) {
                    output.appendString(Deno.args[index]);
                }

                if (append) {
                    output.appendChar(c);
                }

                kind = TokenKind.None;
                continue;
            }

            if (!isValidBashVariable(key)) {
                throw new Error(`Bad substitution, invalid variable name ${key}.`);
            }

            const value = getValue(key);
            if (value !== undefined && value.length > 0) {
                output.appendString(value);
            }

            if (value === undefined) {
                throw new Error(`Bad substitution, variable ${key} is not set.`);
            }

            if (append) {
                output.appendChar(c);
            }

            kind = TokenKind.None;
            continue;
        }

        tokenBuilder.appendChar(c);
        if (remaining === 0) {
            if (kind === TokenKind.Windows) {
                throw new Error("Bad substitution, missing closing token '%'.");
            }

            if (kind === TokenKind.BashInterpolation) {
                throw new Error("Bad substitution, missing closing token '}'.");
            }
        }
    }

    const r = output.toString();
    output.clear().trimExcess();
    return r;
}
