// @ts-types="npm:@types/chai"
import { assert } from "chai";

/**
 * Asserts that `value` is an instance of `constructor`.
 *
 * @param value The value to check
 * @param constructor The constructor to check against
 * @param msg The optional message to display if the assertion fails.
 */ 
// deno-lint-ignore no-explicit-any
export function instanceOf<T>(value: unknown, constructor: new (...args: any[]) => T, msg?: string) : void {
    return assert.instanceOf(value, constructor, msg);
}