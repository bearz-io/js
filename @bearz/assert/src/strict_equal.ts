import { assert } from "./assert.ts";

/**
 * Asserts that `actual` is strictly equal to `expected`.
 *
 * @param actual The actual value to compare.
 * @param expected The expected value to compare.
 * @param msg The optional message to display if the assertion fails.
 * @example Usage
 * ```ts
 * import { strictEqual } from "@bearz/assert";
 *
 * strictEqual(1, 1); // Doesn't throw
 * strictEqual(1, 2); // Throws
 * ```
 */
export function strictEqual<T>(actual: T, expected: T, msg?: string): void {
    return assert.strictEqual(actual, expected, msg);
}
