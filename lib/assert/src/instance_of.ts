// @ts-types="npm:@types/chai"
import { assert } from "chai";

/**
 * Asserts that `value` is an instance of `constructor`.
 *
 * @param value The value to check
 * @param constructor The constructor to check against
 * @param msg The optional message to display if the assertion fails.
 */
export function instanceOf<T>(
    value: unknown,
    // deno-lint-ignore no-explicit-any
    constructor: new (...args: any[]) => T,
    msg?: string,
): void {
    return assert.instanceOf(value, constructor, msg);
}
