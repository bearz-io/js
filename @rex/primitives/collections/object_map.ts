import { ProxyMap } from "./proxy_map.ts";
import { none, type Option, some } from "@bearz/functional";

export class ObjectMap extends ProxyMap<unknown> {
    array<T = unknown>(key: string): Option<T[]> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        if (!Array.isArray(value)) {
            return none();
        }

        return some(value as T[]);
    }

    string(key: string): Option<string> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        if (typeof value !== "string") {
            return none();
        }

        return some(value as string);
    }

    boolean(key: string): Option<boolean> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        switch (typeof value) {
            case "boolean":
                return some(value as boolean);
            case "string":
                return some(value === "true" || value === "1");
            case "number":
                return some(value !== 0);
            case "bigint":
                return some(value !== 0n);
            default:
                return none();
        }
    }

    int(key: string): Option<number> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        switch (typeof value) {
            case "number": {
                if (!Number.isInteger(value)) {
                    return none();
                }

                return some(value as number);
            }
            case "boolean":
                return some(value ? 1 : 0);
            case "bigint": {
                const n = Number(value);
                if (!Number.isInteger(n)) {
                    return none();
                }

                return some(n);
            }
            case "string": {
                if (value === "") {
                    return none();
                }

                const n = Number.parseInt(value);
                if (!Number.isNaN(n)) {
                    return some(n);
                }

                return none();
            }
            default:
                return none();
        }
    }

    bigint(key: string): Option<bigint> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        switch (typeof value) {
            case "number":
                if (!Number.isInteger(value)) {
                    return none();
                }
                return some(BigInt(value as number));
            case "boolean":
                return some(value ? BigInt(1) : BigInt(0));
            case "bigint":
                return some(value as bigint);
            case "string": {
                if (value === "") {
                    return none();
                }

                const n = Number.parseInt(value);
                if (isNaN(n)) {
                    return none();
                }

                return some(BigInt(n));
            }
            default:
                return none();
        }
    }

    number(key: string): Option<number> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        switch (typeof value) {
            case "number":
                return some(value as number);
            case "boolean":
                return some(value ? 1 : 0);
            case "bigint":
                return some(Number(value));
            case "string": {
                if (value === "") {
                    return none();
                }

                const n = Number.parseFloat(value);
                if (!Number.isNaN(n)) {
                    return some(n);
                }

                return none();
            }
            default:
                return none();
        }
    }
}
