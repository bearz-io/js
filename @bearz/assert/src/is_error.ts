import { AssertionError } from "assertion-error";
import { stripAnsiCode } from "./internal.ts";

/**
 * Make an assertion that `error` is an `Error`.
 * If not then an error will be thrown.
 * An error class and a string that should be included in the
 * error message can also be asserted.
 *
 * @example Usage
 * ```ts no-eval
 * import { isError } from "@bearz/assert";
 *
 * isError(null); // Throws
 * isError(new RangeError("Out of range")); // Doesn't throw
 * isError(new RangeError("Out of range"), SyntaxError); // Throws
 * isError(new RangeError("Out of range"), SyntaxError, "Out of range"); // Doesn't throw
 * isError(new RangeError("Out of range"), SyntaxError, "Within range"); // Throws
 * ```
 *
 * @typeParam E The type of the error to assert.
 * @param error The error to assert.
 * @param ErrorClass The optional error class to assert.
 * @param msgMatches The optional string or RegExp to assert in the error message.
 * @param msg The optional message to display if the assertion fails.
 */
export function isError<E extends Error = Error>(
    error: unknown,
    // deno-lint-ignore no-explicit-any
    ErrorClass?: abstract new (...args: any[]) => E,
    msgMatches?: string | RegExp,
    msg?: string,
): asserts error is E {
    const msgSuffix = msg ? `: ${msg}` : ".";
    if (!(error instanceof Error)) {
        throw new AssertionError(`Expected "error" to be an Error object${msgSuffix}}`);
    }
    if (ErrorClass && !(error instanceof ErrorClass)) {
        msg =
            `Expected error to be instance of "${ErrorClass.name}", but was "${error?.constructor?.name}"${msgSuffix}`;
        throw new AssertionError(msg);
    }
    // biome-ignore lint/suspicious/noImplicitAnyLet:
    let msgCheck;
    if (typeof msgMatches === "string") {
        msgCheck = stripAnsiCode(error.message).includes(stripAnsiCode(msgMatches));
    }
    if (msgMatches instanceof RegExp) {
        msgCheck = msgMatches.test(stripAnsiCode(error.message));
    }
    if (msgMatches && !msgCheck) {
        msg = `Expected error message to include ${
            msgMatches instanceof RegExp ? msgMatches.toString() : JSON.stringify(msgMatches)
        }, but got ${JSON.stringify(error?.message)}${msgSuffix}`;
        throw new AssertionError(msg);
    }
}
