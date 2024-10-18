import { assert } from './assert.ts';

/**
 * Asserts that `actual` array includes the `expected` value.
 *
 * @example Usage
 * ```ts
 * import { arrayIncludes } from "@bearz/assert";
 *
 * arrayIncludes([1, 2, 3], 2); // Doesn't throw
 * arrayIncludes([1, 2, 3], 4); // Throws
 * ```
 *
 * @param actual The array to check
 * @param expected The value to check for.
 * @param msg The optional message to display if the assertion fails.
 * @returns 
 */
export function arrayIncludes<T>(actual: T[], expected: T, msg?: string) {
    return assert.include<T>(actual, expected, msg);
}