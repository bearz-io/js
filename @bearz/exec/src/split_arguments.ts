/**
 * Split a string into an array of arguments. The function will handle
 * arguments that are quoted, arguments that are separated by spaces, and multiline
 * strings that include a backslash (\\) or backtick (`) at the end of the line for cases
 * where the string uses bash or powershell multi line arguments.
 * @param value
 * @returns a `string[]` of arguments.
 * @example
 * ```ts
 * const args0 = splitArguments("hello world");
 * console.log(args0); // ["hello", "world"]
 *
 * const args1 = splitArguments("hello 'dog world'");
 * console.log(args1); // ["hello", "dog world"]
 *
 * const args2 = splitArguments("hello \"cat world\"");
 * console.log(args2); // ["hello", "cat world"]
 *
 * const myArgs = `--hello \
 * "world"`
 * const args3 = splitArguments(myArgs);
 * console.log(args3); // ["--hello", "world"]
 * ```
 */
export function splitArguments(value: string): string[] {
    enum Quote {
        None = 0,
        Single = 1,
        Double = 2,
    }

    let token = "";
    let quote = Quote.None;
    const tokens = [];

    for (let i = 0; i < value.length; i++) {
        const c = value[i];

        if (quote > Quote.None) {
            if ((c === "'" || c === '"') && value[i - 1] === "\\") {
                token = token.slice(0, token.length - 1) + c;
                continue;
            }

            if (quote === Quote.Single && c === "'") {
                quote = Quote.None;
                tokens.push(token);
                token = "";
                continue;
            } else if (quote === Quote.Double && c === '"') {
                quote = Quote.None;
                tokens.push(token);
                token = "";
                continue;
            }

            token += c;
            continue;
        }

        if (c === " ") {
            const remaining = (value.length - 1) - i;
            if (remaining > 2) {
                // if the line ends with characters that normally allow for scripts with multiline
                // statements, consume token and skip characters.
                // ' \\\n'
                // ' \\\r\n'
                // ' `\n'
                // ' `\r\n'
                const j = value[i + 1];
                const k = value[i + 2];
                if (j === "'" || j === "`") {
                    if (k === "\n") {
                        i += 2;
                        if (token.length > 0) {
                            tokens.push(token);
                        }
                        token = "";
                        continue;
                    }

                    if (remaining > 3) {
                        const l = value[i + 3];
                        if (k === "\r" && l === "\n") {
                            i += 3;
                            if (token.length > 0) {
                                tokens.push(token);
                            }
                            token = "";
                            continue;
                        }
                    }
                }
            }

            if (token.length > 0) {
                tokens.push(token);
                token = "";
            }
            continue;
        }

        if (c === "\\") {
            const next = value[i + 1];
            if (next === " " || next === "'" || next === '"') {
                token += c;
                token += next;
                i++;
                continue;
            } else {
                token += c;
                continue;
            }
        }

        if (token.length === 0) {
            if (c === "'" || c === '"') {
                if (value[i - 1] === "\\") {
                    token += c;
                    continue;
                }

                quote = c === "'" ? Quote.Single : Quote.Double;
                continue;
            }
        }

        token += c;
    }

    if (token.length > 0) {
        tokens.push(token);
    }

    return tokens;
}
