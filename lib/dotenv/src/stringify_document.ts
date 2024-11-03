import type { DotEnvDocument } from "./document.ts";
import { StringBuilder } from "@bearz/strings";
import { EOL } from "@bearz/runtime-info/os";

/**
 * Options for {@linkcode stringifyDocument} a document.
 */
export interface StringifyDocumentOptions {
    /**
     * If true, only line feeds will be used as newlines `\n`.
     */
    onlyLineFeed?: boolean;
}

/**
 * Converts a DotEnvDocument into a string representation.
 *
 * @param document - The DotEnvDocument to be converted.
 * @param options - Optional settings to customize the stringification process.
 * @returns The string representation of the DotEnvDocument.
 */
export function stringifyDocument(
    document: DotEnvDocument,
    options?: StringifyDocumentOptions,
): string {
    const sb = new StringBuilder();
    let i = 0;
    const o = options ?? {};
    const nl = o.onlyLineFeed ? "\n" : EOL;
    for (const token of document) {
        switch (token.kind) {
            case "comment":
                if (i > 0) {
                    sb.append(nl);
                }
                sb.append("#").append(token.value);
                break;
            case "newline":
                sb.append(nl);
                break;
            case "item":
                {
                    if (i > 0) {
                        sb.append(nl);
                    }
                    sb.append(token.key).append("=");
                    let quote = "'";
                    let value = token.value;
                    if (value.includes(quote) || value.includes("\n")) {
                        quote = '"';
                        value = value.replace(/"/g, '\\"');
                    }
                    sb.append(quote).append(value).append(quote);
                }
                break;
        }
        i++;
    }
    return sb.toString();
}
