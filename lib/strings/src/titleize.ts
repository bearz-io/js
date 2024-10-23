import { titleize as og } from "@bearz/slices/titleize";

export function titleize(s: string): string {
    const r = og(s);

    return String.fromCodePoint(...r);
}
