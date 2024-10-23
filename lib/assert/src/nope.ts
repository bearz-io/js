import { assert } from "./assert.ts";

/**
 * Asserts that `value` is falsy.
 * @param value The value to check
 * @param msg The optional message to display if the assertion fails.
 */
export function nope(value: unknown, msg?: string): void {
    return assert.notOk(value, msg);
}
