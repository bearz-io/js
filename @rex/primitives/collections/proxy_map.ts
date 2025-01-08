import { none, type Option, some } from "@bearz/functional";

/**
 * The ProxyObject interface represents an object that can be accessed using a Proxy
 */
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

/**
 * A specialized Map that provides additional utility methods and a proxy interface.
 *
 * @template V - The type of values stored in the map.
 */
/**
 * A specialized map that extends the native `Map` class with additional utility methods.
 *
 * @template V The type of the values stored in the map.
 */
export class ProxyMap<V = unknown> extends Map<string, V> {
    #proxy?: ProxyObject;

    /**
     * Checks if the map is empty.
     *
     * @returns {boolean} `true` if the map is empty, otherwise `false`.
     */
    empty(): boolean {
        return this.size === 0;
    }

    /**
     * Gets the proxy object for this instance. If the proxy object does not already exist,
     * it creates a new proxy object using the `proxy` function and assigns it to the private
     * `#proxy` property.
     *
     * @returns {ProxyObject} The proxy object for this instance.
     */
    get proxy(): ProxyObject {
        if (!this.#proxy) {
            this.#proxy = proxy(this);
        }

        return this.#proxy;
    }

    /**
     * Checks if a key exists in the map.
     *
     * @param {string} key The key to check for existence.
     * @returns {boolean} `true` if the key exists in the map, otherwise `false`.
     */
    exists(key: string): boolean {
        const value = this.get(key);
        return value !== undefined && value !== null;
    }

    /**
     * Merges the map with another object or another `ProxyMap`.
     *
     * @param {Record<string, V> | ProxyMap<V>} obj The object or `ProxyMap` to merge with.
     * @returns {this} The current instance of the map.
     */
    merge(obj: Record<string, V> | ProxyMap<V>): this {
        if (obj instanceof ProxyMap) {
            obj = obj.toObject();
        }

        for (const [key, value] of Object.entries(obj)) {
            this.set(key, value);
        }

        return this;
    }

    /**
     * Tries to get a value from the map.
     *
     * @param {string} key The key of the value to get.
     * @returns {Option<V>} An `Option` containing the value if it exists, otherwise `none`.
     */
    tryGet(key: string): Option<V> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        return some(value as V);
    }

    /**
     * Queries a value from the map using a dot-separated path.
     *
     * @param {string} path The path to the value.
     * @returns {Option<V>} An `Option` containing the value if it exists, otherwise `none`.
     */
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

    /**
     * Converts the map to a plain object.
     *
     * @returns {Record<string, V>} A plain object representation of the map.
     */
    toObject(): Record<string, V> {
        return Object.fromEntries(this.entries()) as Record<string, V>;
    }
}
