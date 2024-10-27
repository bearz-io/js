import { assert } from "./assert.ts";

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

export function arrayIncludes<T>(actual: T[], expected: T[], msg?: string): void;
export function arrayIncludes<T>(actual: T[], expected: T, msg?: string): void;
export function arrayIncludes<T>(): void {
    switch (arguments.length) {
        case 2:
            {
                const actual = arguments[0];
                const expected = arguments[1];
                if (Array.isArray(expected)) {
                    assert.includeDeepMembers(actual, expected);
                } else {
                    assert.include(actual, expected);
                }
            }
         
            break;

        case 3:
            {
                const actual = arguments[0];
                const expected = arguments[1];
                const msg = arguments[2];
                if (Array.isArray(expected)) {
                    assert.includeDeepMembers(actual, expected, msg);
                } else {
                    assert.include(actual, expected, msg);
                }
            }
            break;
        default:
            throw new Error("arrayIncludes() expects either 2 or 3 arguments");
    }
}
