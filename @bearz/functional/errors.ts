import { NotFoundError } from "@bearz/errors/not-found";
import { AbortError } from "@bearz/errors/abort";
import { TimeoutError } from "@bearz/errors/timeout";
import { PanicError } from "@bearz/errors/panic";
import { fail, type Result } from "./result.ts";

/**
 * Creates a result of Result<T> as an Err result and coerces the provided error
 * to an Error if it is not already an Error.
 * @returns A new Err result with a value of error.
 */
export function failAsError<T = unknown>(error: unknown): Result<T> {
    if (error instanceof Error) {
        return fail(error);
    }

    return fail(new Error(`Unexpected error: ${error}`));
}

/**
 * Determines if the result is an error and the error is a not found error.
 * @param res The result to check.
 * @returns `true` if the result is an error and the error is a not found error, otherwise `false`.
 */
export function notFound<T = unknown>(res: Result<T>): boolean {
    return res.testError((e) => NotFoundError.is(e));
}

/**
 * Determines if the result is an error and the error is a timeout error.
 * @param res The result to check.
 * @returns `true` if the result is an error and the error is a timeout error, otherwise `false`.
 */
export function timedout<T = unknown>(res: Result<T>): boolean {
    return res.testError((e) => TimeoutError.is(e));
}

/**
 * Determines if the result is an error and the error is an abort error.
 * @param res The result to check.
 * @returns `true` if the result is an error and the error is an abort error, otherwise `false`.
 */
export function aborted<T = unknown>(res: Result<T>): boolean {
    return res.testError((e) => AbortError.is(e));
}

/**
 * Determines if the result is an error and the error is a panic error.
 * @param res The result to check.
 * @returns `true` if the result is an error and the error is a panic error, otherwise `false`.
 */
export function isPanic<T = unknown>(res: Result<T>): boolean {
    return res.testError((e) => PanicError.is(e));
}

/**
 * Aborts an operation with an abort signal.
 * @param signal The signal to use for the abort.
 * @returns A result that is always an error with an abort error.
 */
export function abort(signal: AbortSignal): Result<never> {
    if (signal.reason) {
        if (AbortError.is(signal.reason)) {
            return fail(signal.reason);
        }

        if (signal.reason instanceof Error) {
            return fail(new AbortError({ cause: signal.reason }));
        }

        return fail(
            new AbortError(`Operation cancelled: ${signal.reason}`, { reason: signal.reason }),
        );
    }

    return fail(new AbortError());
}
