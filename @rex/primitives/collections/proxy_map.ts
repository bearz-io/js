import { none, type Option, some } from "@bearz/functional";

export interface ProxyObject extends Record<string, unknown> {
}

function proxy<T extends ProxyObject>(map: Map<string, unknown>): ProxyObject {
    return new Proxy({}, {
        get(_, key) {
            if (typeof key === "string" && key !== "") {
                return map.get(key);
            }

            return undefined;
        },
        deleteProperty(_, key) {
            if (typeof key !== "string") {
                return false;
            }

            return map.delete(key);
        },
        has(_, key) {
            if (typeof key !== "string") {
                return false;
            }

            return map.has(key);
        },
        ownKeys(_) {
            return Array.from(map.keys());
        },
        set(_, key, value) {
            if (typeof key !== "string") {
                return false;
            }

            map.set(key as string, value);

            return true;
        },
    }) as ProxyObject;
}

export class ProxyMap<V = unknown> extends Map<string, V> {
    #proxy?: ProxyObject;

    empty(): boolean {
        return this.size === 0;
    }

    get proxy(): ProxyObject {
        if (!this.#proxy) {
            this.#proxy = proxy(this);
        }

        return this.#proxy;
    }

    exists(key: string): boolean {
        const value = this.get(key);
        return value !== undefined && value !== null;
    }

    merge(obj: Record<string, V> | ProxyMap<V>): this {
        if (obj instanceof ProxyMap) {
            obj = obj.toObject();
        }

        for (const [key, value] of Object.entries(obj)) {
            this.set(key, value);
        }

        return this;
    }

    tryGet(key: string): Option<V> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        return some(value as V);
    }

    query(path: string): Option<V> {
        const keys = path.split(".");
        let value: unknown = this as ProxyMap<V>;
        for (const key of keys) {
            if (value === null || value === undefined) {
                return none();
            }

            if (Array.isArray(value)) {
                const index = Number.parseInt(key);
                if (Number.isNaN(index)) {
                    return none();
                }

                value = value[index];
                continue;
            }

            if (value instanceof ProxyMap) {
                if (!value.has(key)) {
                    return none();
                }

                value = value.get(key);
                continue;
            }

            if (typeof value === "object" && value !== null) {
                value = (value as Record<string, unknown>)[key];
                continue;
            }

            return none();
        }

        return some(value as V);
    }

    toObject(): Record<string, V> {
        return Object.fromEntries(this.entries()) as Record<string, V>;
    }
}
