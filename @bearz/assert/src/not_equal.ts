import { assert } from "./assert.ts";

/**
 * Asserts that `actual` is not equal to `expected` using deep equality.
 *
 * @param actual The actual value to compare.
 * @param expected The expected value to compare.
 * @param msg The optional message to display if the assertion fails.
 * @example Usage
 * ```ts
 * import { notEqual } from "@bearz/assert";
 *
 * notEqual(1, 1); // Throws
 * notEqual(1, 2); // Doesn't throw
 * ```
 */
export function notEqual<T>(actual: T, expected: T, msg?: string): void {
    return assert.notDeepEqual(actual, expected, msg);
}
