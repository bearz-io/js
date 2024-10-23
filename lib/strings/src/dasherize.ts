import { dasherize as og, type DasherizeOptions } from "@bearz/slices/dasherize";

export function dasherize(value: string, options?: DasherizeOptions): string {
    const r = og(value, options);
    return String.fromCodePoint(...r);
}
