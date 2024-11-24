import { AssertionError } from "assertion-error";

/**
 * Use this to assert failed test.
 *
 * @example Usage
 * ```ts no-eval
 * import { unreachable } from "@bearz/assert";
 *
 * unreachable(); // Throws
 * ```
 *
 * @param msg Optional message to include in the error.
 * @returns Never returns, always throws.
 */
export function fail(msg?: string): never {
    const msgSuffix = msg ? `: ${msg}` : ".";
    throw new AssertionError(`Failed assertion${msgSuffix}`);
}
