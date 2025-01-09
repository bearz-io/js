import { NotFoundError } from "@bearz/errors/not-found";
import { AbortError } from "@bearz/errors/abort";
import { TimeoutError } from "@bearz/errors/timeout";
import { type Result, fail } from "./result.ts";


/**
 * Creates a result of Result<T> as an Err result and coerces the provided error 
 * to an Error if it is not already an Error.
 * @returns A new Err result with a value of error.
 */
export function coerceError<T = unknown>(error: unknown): Result<T> {
    if (error instanceof Error) {
        return fail(error);
    }

    return fail(new Error(`${error}`));
}

/**
 * Determines if the result is an error and the error is a not found error.
 * @param res The result to check.
 * @returns `true` if the result is an error and the error is a not found error, otherwise `false`.
 */
export function notFound<T = unknown>(res: Result<T>) {
    return res.isError && NotFoundError.is(res.unwrapError())
}

export function timedout<T = unknown>(res :Result<T>) : boolean {
    return res.isError && TimeoutError.is(res.unwrapError());
}

export function aborted<T = unknown>(res :Result<T>) : boolean {
    return res.isError && AbortError.is(res.unwrapError());
}

/**
 * Aborts an operation with an abort signal.
 * @param signal The signal to use for the abort.
 * @returns A result that is always an error with an abort error.
 */
export function abort(signal: AbortSignal) : Result<never> {
    if (signal.reason) 
        return coerceError(signal.reason);

    return fail(new AbortError());
}


