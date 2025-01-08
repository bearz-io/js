// Original source: https://github.com/sindresorhus/is-network-error/blob/main/index.js
// License: MIT https://github.com/sindresorhus/is-network-error/blob/main/license

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

    return new Error(String(value));
}
