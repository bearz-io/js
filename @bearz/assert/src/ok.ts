import { assert } from "./assert.ts";

/**
 * Asserts that `value` is truthy.
 * @param value The value to check
 * @param msg The optional message to display if the assertion fails.
 */
export function ok(value: unknown, msg?: string): asserts value {
    return assert.ok(value, msg);
}
