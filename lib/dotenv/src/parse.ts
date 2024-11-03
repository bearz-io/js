import { parseDocument } from "./parse_document.ts";

export function parse(source: string): Record<string, string> {
    const document = parseDocument(source);
    return document.toObject();
}
