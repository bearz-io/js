import type { Lookup } from "../lookup.ts";
import { none, type Option, some } from "@bearz/functional";
import { ProxyMap } from "./proxy_map.ts";

/**
 * A specialized map that extends the native `Map` class with additional utility methods.
 * Each method returns an `Option` type that either contains the value if it exists and is of the
 * correct type, or `none` if the value is missing or not of the expected type.
 *
 * @extends ProxyMap<unknown>
 */
export class ObjectMap extends ProxyMap<unknown> {
    /**
     * Retrieves an array value from the map.
     *
     * @template T The type of the elements in the array.
     * @param {string} key The key of the value to retrieve.
     * @returns {Option<T[]>} An `Option` containing the array value, or `none` if the key does not exist or the value is not an array.
     */
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

    /**
     * Retrieves an object value from the map.
     *
     * @param {string} key The key of the value to retrieve.
     * @returns {Option<Lookup>} An `Option` containing the object value, or `none` if the key does not exist or the value is not an object.
     */
    object(key: string): Option<Lookup> {
        const value = this.get(key);
        if (typeof value !== "object" || Array.isArray(value) || value === null) {
            return none();
        }

        return some(value as Lookup);
    }

    /**
     * Retrieves a nested `ObjectMap` value from the map.
     *
     * @param {string} key The key of the value to retrieve.
     * @returns {Option<ObjectMap>} An `Option` containing the `ObjectMap` value, or `none` if the key does not exist or the value is not an `ObjectMap`.
     */
    map(key: string): Option<ObjectMap> {
        const value = this.get(key);
        if (value instanceof ObjectMap) {
            return some(value);
        }

        return none();
    }

    /**
     * Retrieves a string value from the map.
     *
     * @param {string} key The key of the value to retrieve.
     * @returns {Option<string>} An `Option` containing the string value, or `none` if the key does not exist or the value is not a string.
     */
    string(key: string): Option<string> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        if (typeof value !== "string") {
            return none();
        }

        return some(value);
    }

    /**
     * Retrieves a boolean value from the map.
     *
     * @param {string} key The key of the value to retrieve.
     * @returns {Option<boolean>} An `Option` containing the boolean value, or `none` if the key does not exist or the value is not a boolean.
     */
    boolean(key: string): Option<boolean> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        if (typeof value !== "boolean") {
            return none();
        }

        return some(value);
    }

    /**
     * Retrieves an integer value from the map.
     *
     * @param {string} key The key of the value to retrieve.
     * @returns {Option<number>} An `Option` containing the integer value, or `none` if the key does not exist or the value is not an integer.
     */
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

    /**
     * Retrieves a bigint value from the map.
     *
     * @param {string} key The key of the value to retrieve.
     * @returns {Option<bigint>} An `Option` containing the bigint value, or `none` if the key does not exist or the value is not a bigint.
     */
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

    /**
     * Retrieves a number value from the map.
     *
     * @param {string} key The key of the value to retrieve.
     * @returns {Option<number>} An `Option` containing the number value, or `none` if the key does not exist or the value is not a number.
     */
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
