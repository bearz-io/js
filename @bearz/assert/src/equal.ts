import { assert } from "./assert.ts";

/**
 * Asserts that `actual` is equal to `expected` using deep equality.
 *
 * @param actual The actual value to compare.
 * @param expected The expected value to compare.
 * @param msg The optional message to display if the assertion fails.
 * @example Usage
 * ```ts
 * import { equal } from "@bearz/assert";
 *
 * equal(1, 1); // Doesn't throw
 * equal(1, 2); // Throws
 * ```
 */
export function equal<T>(actual: T, expected: T, msg?: string): void {
    return assert.deepEqual(actual, expected, msg);
}
