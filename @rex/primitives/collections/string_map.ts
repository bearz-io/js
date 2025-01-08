import { none, type Option, some } from "@bearz/functional";
import { ProxyMap } from "./proxy_map.ts";
import { equalFold } from "@bearz/strings/equal";

/**
 * A specialized map that extends the native `Map` class with additional utility methods.
 *
 * @template V The type of the values stored in the map.
 */
export class StringMap extends ProxyMap<string> {
    static fromObject(obj: Record<string, string>): StringMap {
        const map = new StringMap();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key, value);
        }
        return map;
    }

    /**
     * Creates a new `StringMap` instance from a plain object.
     *
     * @param {Record<string, string>} obj The object to convert to a `StringMap`.
     * @returns {StringMap} The new `StringMap` instance.
     */
    override toObject(): Record<string, string> {
        const obj: Record<string, string> = {};
        for (const [key, value] of this.entries()) {
            obj[key] = value;
        }
        return obj;
    }

    /**
     * Gets the value associated with the specified key.
     *
     * @param {string} key The key of the value to get.
     * @returns {Option<string>} The value associated with the specified key, or `none` if the key does not exist.
     */
    boolean(key: string): Option<boolean> {
        const value = this.get(key);
        if (value === undefined || value === null) {
            return none();
        }

        return some(equalFold(value, "true") || equalFold(value, "1"));
    }

    /**
     * Retrieves an integer value from the map.
     *
     * @param {string} key The key of the value to retrieve.
     * @returns {Option<number>} An `Option` containing the integer value, or `none` if the key does not exist.
     */
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

    /**
     * Retrieves a `BigInt` value from the map.
     *
     * @param {string} key The key of the value to retrieve.
     * @returns {Option<bigint>} An `Option` containing the `BigInt` value, or `none` if the key does not exist.
     */
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

    /**
     * Retrieves a floating-point value from the map.
     *
     * @param {string} key The key of the value to retrieve.
     * @returns {Option<number>} An `Option` containing the floating-point value, or `none` if the key does not exist.
     */
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
