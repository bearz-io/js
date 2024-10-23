import { capitalize as og, type CapitalizeOptions } from "@bearz/slices/capitalize";

export function capitalize(value: string, options?: CapitalizeOptions): string {
    const r = og(value, options);
    return String.fromCodePoint(...r);
}
