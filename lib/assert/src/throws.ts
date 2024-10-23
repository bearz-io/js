// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { isError } from "./is_error.ts";
import { AssertionError } from "assertion-error";

/**
 * Executes a function, expecting it to throw. If it does not, then it
 * throws.
 *
 * To assert that an asynchronous function rejects, use
 * {@linkcode assertRejects}.
 *
 * @example Usage
 * ```ts ignore
 * import { throws } from "@std/assert";
 *
 * assertThrows(() => { throw new TypeError("hello world!"); }); // Doesn't throw
 * assertThrows(() => console.log("hello world!")); // Throws
 * ```
 *
 * @param fn The function to execute.
 * @param msg The optional message to display if the assertion fails.
 * @returns The error that was thrown.
 */
export function throws(
    fn: () => unknown,
    msg?: string,
): unknown;
/**
 * Executes a function, expecting it to throw. If it does not, then it
 * throws. An error class and a string that should be included in the
 * error message can also be asserted.
 *
 * To assert that an asynchronous function rejects, use
 * {@linkcode assertRejects}.
 *
 * @example Usage
 * ```ts ignore
 * import { throws } from "@bearz/assert";
 *
 * throws(() => { throw new TypeError("hello world!"); }, TypeError); // Doesn't throw
 * throws(() => { throw new TypeError("hello world!"); }, RangeError); // Throws
 * ```
 *
 * @typeParam E The error class to assert.
 * @param fn The function to execute.
 * @param ErrorClass The error class to assert.
 * @param msgIncludes The string that should be included in the error message.
 * @param msg The optional message to display if the assertion fails.
 * @returns The error that was thrown.
 */
export function throws<E extends Error = Error>(
    fn: () => unknown,
    // deno-lint-ignore no-explicit-any
    ErrorClass: abstract new (...args: any[]) => E,
    msgIncludes?: string,
    msg?: string,
): E;
export function throws<E extends Error = Error>(
    fn: () => unknown,
    errorClassOrMsg?:
        // deno-lint-ignore no-explicit-any
        | (abstract new (...args: any[]) => E)
        | string,
    msgIncludesOrMsg?: string,
    msg?: string,
): E | Error | unknown {
    // deno-lint-ignore no-explicit-any
    let ErrorClass: (abstract new (...args: any[]) => E) | undefined;
    let msgIncludes: string | undefined;
    let err;

    if (typeof errorClassOrMsg !== "string") {
        if (
            errorClassOrMsg === undefined ||
            errorClassOrMsg?.prototype instanceof Error ||
            errorClassOrMsg?.prototype === Error.prototype
        ) {
            ErrorClass = errorClassOrMsg;
            msgIncludes = msgIncludesOrMsg;
        } else {
            msg = msgIncludesOrMsg;
        }
    } else {
        msg = errorClassOrMsg;
    }
    let doesThrow = false;
    const msgSuffix = msg ? `: ${msg}` : ".";
    try {
        fn();
    } catch (error) {
        if (ErrorClass) {
            if (error instanceof Error === false) {
                throw new AssertionError(`A non-Error object was thrown${msgSuffix}`);
            }
            isError(
                error,
                ErrorClass,
                msgIncludes,
                msg,
            );
        }
        err = error;
        doesThrow = true;
    }
    if (!doesThrow) {
        msg = `Expected function to throw${msgSuffix}`;
        throw new AssertionError(msg);
    }
    return err;
}
