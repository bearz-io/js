import { assert } from "./assert.ts";

/**
 * Asserts that `value` is not an instance of `constructor`.
 *
 * @param value The value to check
 * @param constructor The constructor to check against
 * @param msg The optional message to display if the assertion fails.
 */

export function notInstanceOf<T>(
    value: unknown,
    // deno-lint-ignore no-explicit-any
    constructor: new (...args: any[]) => T,
    msg?: string,
): void {
    return assert.notInstanceOf(value, constructor, msg);
}
