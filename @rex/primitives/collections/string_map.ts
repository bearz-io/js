import { none, type Option, some } from "@bearz/functional";
import { ProxyMap } from "./proxy_map.ts";
import { equalFold } from "@bearz/strings/equal";

export class StringMap extends ProxyMap<string> {
    static fromObject(obj: Record<string, string>): StringMap {
        const map = new StringMap();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key, value);
        }
        return map;
    }

    override toObject(): Record<string, string> {
        const obj: Record<string, string> = {};
        for (const [key, value] of this.entries()) {
            obj[key] = value;
        }
        return obj;
    }

    boolean(key: string): Option<boolean> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        return some(equalFold(value, "true") || equalFold(value, "1"));
    }

    int(key: string): Option<number> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        if (value === "") {
            return none();
        }

        const n = Number.parseInt(value);
        if (!Number.isNaN(n)) {
            return some(n);
        }

        return none();
    }

    bigint(key: string): Option<bigint> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        if (value === "") {
            return none();
        }

        if (value === "") {
            return none();
        }

        const n = Number.parseInt(value);
        if (isNaN(n)) {
            return none();
        }

        return some(BigInt(n));
    }

    number(key: string): Option<number> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        if (value === "") {
            return none();
        }

        const n = Number.parseFloat(value);
        if (!Number.isNaN(n)) {
            return some(n);
        }

        return none();
    }
}
