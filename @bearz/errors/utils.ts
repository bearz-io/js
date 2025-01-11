// Original source: https://github.com/sindresorhus/is-network-error/blob/main/index.js
// License: MIT https://github.com/sindresorhus/is-network-error/blob/main/license
import { PanicError } from "./panic_error.ts";

const objectToString = Object.prototype.toString;

/**
 * Checks if the given value is an instance of the Error object.
 *
 * @param value - The value to check.
 * @returns A boolean indicating whether the value is an Error.
 */
export function isError(value: unknown): value is Error {
    return objectToString.call(value) === "[object Error]";
}

const errorMessages = new Set([
    "network error", // Chrome
    "Failed to fetch", // Chrome
    "NetworkError when attempting to fetch resource.", // Firefox
    "The Internet connection appears to be offline.", // Safari 16
    "Load failed", // Safari 17+
    "Network request failed", // `cross-fetch`
    "fetch failed", // Undici (Node.js)
    "terminated", // Undici (Node.js)
]);

/**
 * Checks if the given error is a network error.
 *
 * This function verifies if the provided error is an instance of `Error`,
 * has a name of 'TypeError', and contains a string message. Additionally,
 * it performs a specific check for Safari 17+ where network errors have
 * a generic message 'Load failed' and no stack trace.
 *
 * @param error - The error to check.
 * @returns `true` if the error is a network error, otherwise `false`.
 */
export function isNetworkError(error: unknown): error is TypeError {
    const isValid = error &&
        isError(error) &&
        error.name === "TypeError" &&
        typeof error.message === "string";

    if (!isValid) {
        return false;
    }

    // We do an extra check for Safari 17+ as it has a very generic error message.
    // Network errors in Safari have no stack.
    if (error.message === "Load failed") {
        return error.stack === undefined;
    }

    return errorMessages.has(error.message);
}

// end of original source

/**
 * Converts an unknown value to an Error object.
 *
 * @param value - The value to convert to an Error. If the value is already an Error, it is returned as is.
 * @returns An Error object representing the given value.
 */
export function toError(value: unknown): Error {
    if (isError(value)) {
        return value;
    }

    return new Error(`Unexpected error: ${value}`);
}
/**
 * Creates a panic error and throws it.
 * @param message The message to include in the panic error.
 */
export function panic(message: unknown): never {
    if (message instanceof Error) {
        throw new PanicError(message.message, { cause: message });
    }

    if (typeof message === "string") {
        throw new PanicError(message);
    }

    throw new PanicError(`Unexpected panic: ${message}`);
}

/**
 * Creates a panic error and throws it if the condition is truthy.
 * @param condition The condition to check. If the condition is truthy, a panic error is thrown.
 * @param message The message to include in the panic error.
 */
export function panicIf(condition: unknown, message?: unknown): never | undefined {
    if (condition) {
        panic(message);
    }
}

/**
 * Determines if the value is a `PanicError`.
 * @param value The value to check.
 * @returns `true` if the value is a `PanicError`, otherwise `false`.
 */
export function isPanic(value: unknown): value is PanicError {
    return PanicError.is(value);
}

/**
 * Creates an aggregate error from the provided errors.
 * @param message The message to include in the aggregate error.
 * @param errors The errors to include in the aggregate error.
 * @returns An aggregate error containing the provided errors.
 */
export function join(message: string, ...errors: Error[]): AggregateError;
/**
 * Creates an aggregate error from the provided errors.
 * @param errors The errors to include in the aggregate error.
 * @returns An aggregate error containing the provided errors.
 */
export function join(...errors: Error[]): AggregateError;
export function join(): AggregateError {
    const first = arguments[0];
    if (typeof first === "string") {
        return new AggregateError(Array.from(arguments).slice(1), first);
    }

    return new AggregateError(Array.from(arguments));
}
