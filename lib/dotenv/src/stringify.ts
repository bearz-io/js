import { StringBuilder } from "@bearz/strings";
import { EOL } from "@bearz/runtime-info/os";

export interface StringifyOptions {
    onlyLineFeed?: boolean;
}

export function stringify(env: Record<string, string>, options?: StringifyOptions): string {
    const sb = new StringBuilder();
    let i = 0;
    const o = options ?? {};
    const nl = o.onlyLineFeed ? "\n" : EOL;
    for (const key in env) {
        if (i > 0) {
            sb.append(nl);
        }
        let value = env[key];
        sb.append(key).append("=");
        let quote = "'";
        if (value.includes(quote) || value.includes("\n")) {
            quote = '"';
            value = value.replace(/"/g, '\\"');
        }
        sb.append(quote).append(value).append(quote);
        i++;
    }
    return sb.toString();
}
