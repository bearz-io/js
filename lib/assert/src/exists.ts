import { assert } from "./assert.ts";

/**
 * Asserts that `value` is not `null` or `undefined`.
 * @param value The value to check
 * @param msg The optional message to display if the assertion fails.
 */
export function exists<T>(value: T, msg?: string): asserts value is NonNullable<T> {
    return assert.exists(value, msg);
}
