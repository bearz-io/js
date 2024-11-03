import {
    CHAR_0,
    CHAR_9,
    CHAR_BACKWARD_SLASH,
    CHAR_CARRIAGE_RETURN,
    CHAR_DOUBLE_QUOTE,
    CHAR_EQUAL,
    CHAR_GRAVE_ACCENT,
    CHAR_HASH,
    CHAR_LINE_FEED,
    CHAR_LOWERCASE_A,
    CHAR_LOWERCASE_Z,
    CHAR_SINGLE_QUOTE,
    CHAR_SPACE,
    CHAR_TAB,
    CHAR_UNDERSCORE,
    CHAR_UPPERCASE_A,
    CHAR_UPPERCASE_Z,
} from "@bearz/chars/constants";
import { StringBuilder } from "@bearz/strings";
import { isSpace } from "@bearz/chars/is-space";
import { DotEnvDocument } from "./document.ts";

const CHAR_N = 110;
const CHAR_R = 114;
const CHAR_T = 116;

enum Quotes {
    None = 0,
    Single = 1,
    Double = 2,
    BackTick = 3,
    Closed = 4,
}

export function parseDocument(content: string): DotEnvDocument {
    const sb = new StringBuilder();
    let quote = Quotes.None;
    let inValue = false;
    let line = 1;
    const last = content.length - 1;
    let key = "";
    const doc = new DotEnvDocument();

    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);

        if (!inValue) {
            if (char === CHAR_HASH && sb.length === 0) {
                while (i < last) {
                    const next = content.charCodeAt(i + 1);
                    if (next === CHAR_LINE_FEED) {
                        line++;
                        i++;
                        doc.comment(sb.toString());
                        sb.clear();
                        break;
                    }

                    if (next === CHAR_CARRIAGE_RETURN) {
                        if (i < last && content.charCodeAt(i + 2) === CHAR_LINE_FEED) {
                            i++;
                        }

                        line++;
                        i++;
                        doc.comment(sb.toString());
                        sb.clear();
                        break;
                    }

                    sb.appendChar(next);
                    i++;
                }

                continue;
            }

            if (char === CHAR_LINE_FEED) {
                if (sb.length === 0) {
                    line++;
                    doc.newline();
                    continue;
                }

                doc.item(sb.toString(), "");
                sb.clear();
                line++;
                continue;
            }

            if (char === CHAR_CARRIAGE_RETURN) {
                if (i < last && content.charCodeAt(i + 1) === CHAR_LINE_FEED) {
                    i++;
                }

                if (sb.length === 0) {
                    line++;
                    doc.newline();

                    continue;
                }

                doc.item(sb.toString(), "");
                sb.clear();
                line++;
                continue;
            }

            // once you hit a space or tab for the key
            // no other character is allowed except =, \r, \n, space, or tab.
            if (isSpace(char)) {
                if (i === last && sb.length === 0) {
                    doc.newline();
                    break;
                }
                continue;
            }

            if (char === CHAR_EQUAL) {
                if (sb.length === 0) {
                    throw new Error("Empty key on line " + line);
                }

                inValue = true;
                key = sb.toString();
                sb.clear();
                continue;
            }

            if (
                char === CHAR_UNDERSCORE ||
                (char >= CHAR_UPPERCASE_A && char <= CHAR_UPPERCASE_Z) ||
                (char >= CHAR_LOWERCASE_A && char <= CHAR_LOWERCASE_Z) ||
                (char >= CHAR_0 && char <= CHAR_9)
            ) {
                sb.appendChar(char);
                continue;
            }

            throw new Error(
                `Invalid character ${String.fromCharCode(char)} for the key on line ${line}`,
            );
        }

        // in the value

        if (sb.length === 0 && quote === Quotes.None) {
            if (char === CHAR_SPACE || char === CHAR_TAB) {
                continue;
            }

            if (char === CHAR_DOUBLE_QUOTE) {
                quote = Quotes.Double;
                continue;
            }

            if (char === CHAR_SINGLE_QUOTE) {
                quote = Quotes.Single;
                continue;
            }

            if (char === CHAR_GRAVE_ACCENT) {
                quote = Quotes.BackTick;
                continue;
            }

            if (char === CHAR_LINE_FEED) {
                doc.item(key, "");
                line++;
                inValue = false;
                continue;
            }

            if (char === CHAR_CARRIAGE_RETURN) {
                if (i < last && content.charCodeAt(i + 1) === CHAR_LINE_FEED) {
                    i++;
                }

                doc.item(key, "");
                line++;
                inValue = false;
                continue;
            }
        }

        // allow escapes for quotes and new lines when in quotes
        if (char === CHAR_BACKWARD_SLASH && quote !== Quotes.None && quote !== Quotes.Closed) {
            if (i < last) {
                const next = content.charCodeAt(i + 1);
                switch (next) {
                    case CHAR_N:
                        sb.appendChar(CHAR_LINE_FEED);
                        i++;
                        continue;
                    case CHAR_R:
                        sb.appendChar(CHAR_CARRIAGE_RETURN);
                        i++;
                        continue;
                    case CHAR_T:
                        sb.appendChar(CHAR_TAB);
                        i++;
                        continue;

                    case CHAR_SINGLE_QUOTE:
                        if (quote === Quotes.Single) {
                            sb.appendChar(next);
                            i++;
                            continue;
                        }
                        break;

                    case CHAR_DOUBLE_QUOTE:
                        if (quote === Quotes.Double) {
                            sb.appendChar(next);
                            i++;
                            continue;
                        }
                        break;

                    case CHAR_GRAVE_ACCENT:
                        if (quote === Quotes.BackTick) {
                            sb.appendChar(next);
                            i++;
                            continue;
                        }
                        break;
                }
            }
        }

        if (quote === Quotes.Closed) {
            if (char === CHAR_LINE_FEED) {
                if (key.length > 0) {
                    doc.item(key, sb.toString());
                }
                sb.clear();
                line++;
                inValue = false;
                quote = Quotes.None;
                continue;
            }

            if (char === CHAR_CARRIAGE_RETURN) {
                if (i < last && content.charCodeAt(i + 1) === CHAR_LINE_FEED) {
                    i++;
                }

                if (key.length > 0) {
                    doc.item(key, sb.toString());
                }
                sb.clear();
                line++;
                inValue = false;
                quote = Quotes.None;
                continue;
            }

            if (isSpace(char)) {
                continue;
            }

            console.log(doc.toArray());
            throw new Error(
                `Invalid character ${
                    String.fromCharCode(char)
                } for the value on line ${line}. If you need to include spaces, use quotes.`,
            );
        }

        if (quote !== Quotes.None) {
            if (
                quote === Quotes.Double && char === CHAR_DOUBLE_QUOTE ||
                quote === Quotes.Single && char === CHAR_SINGLE_QUOTE ||
                quote === Quotes.BackTick && char === CHAR_GRAVE_ACCENT
            ) {
                quote = Quotes.Closed;
                doc.item(key, sb.toString());
                sb.clear();
                key = "";
                continue;
            }

            if (char === CHAR_LINE_FEED) {
                sb.appendChar(char);
                line++;
                continue;
            }

            if (char === CHAR_CARRIAGE_RETURN) {
                sb.appendChar(char);
                if (i < last && content.charCodeAt(i + 1) === CHAR_LINE_FEED) {
                    i++;
                }

                sb.appendChar(content.charCodeAt(i));
                line++;
                continue;
            }

            sb.appendChar(char);
            continue;
        }

        // no quotes
        if (char === CHAR_LINE_FEED) {
            doc.item(key, sb.toString());
            sb.clear();
            key = "";
            line++;
            inValue = false;
            quote = Quotes.None;
            continue;
        }
        if (char === CHAR_CARRIAGE_RETURN) {
            if (i < last && content.charCodeAt(i + 1) === CHAR_LINE_FEED) {
                i++;
            }

            doc.item(key, sb.toString());
            key = "";
            sb.clear();
            line++;
            quote = Quotes.None;
            inValue = false;
            continue;
        }

        if (isSpace(char)) {
            quote = Quotes.Closed;
            continue;
        }

        sb.appendChar(char);
    }

    if (inValue) {
        if (key !== "" && sb.length > 0) {
            doc.item(key, sb.toString());
        }
    } else {
        if (sb.length > 0) {
            doc.item(sb.toString(), "");
        }
    }

    return doc;
}
