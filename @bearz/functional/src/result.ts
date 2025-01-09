import { Option } from "./option.ts";

enum State {
    Ok,
    Err,
}

/**
 * Represents an error that occurred while processing a result.
 */
export class ResultError extends Error {
    /**
     * Creates a new instance of ResultError.
     * @param message - The error message.
     * @param innerError - The inner error, if any.
     */
    constructor(message?: string, options?: ErrorOptions) {
        super(message ?? "Result error.", options);
        this.name = "ResultError";
    }
}

/**
 * Represents a result that can either be a value of type `T` or an error of type `E`.
 * @typeparam T - The type of the value.
 * @typeparam E - The type of the error.
 */
export class Result<T, E = Error> {
    #state: State;
    #value: T | undefined;
    #error: E | undefined;

    /**
     * Creates a new instance of Result.
     * @param value - The value of type `T`, if any.
     * @param error - The error of type `E`, if any.
     * @throws ResultError if both value and error are provided.
     */
    constructor(value?: T, error?: E) {
        if (value !== undefined && error !== undefined) {
            throw new ResultError("Result cannot have both value and error");
        }

        this.#state = value !== undefined && value !== null ? State.Ok : State.Err;
        this.#value = value;
        this.#error = error;
    }

    /**
     * Gets a value indicating whether the result is Ok.
     */
    get isOk(): boolean {
        return this.#state === State.Ok;
    }

    /**
     * Gets a value indicating whether the result is an error.
     */
    get isError(): boolean {
        return this.#state === State.Err;
    }

    /**
     * Returns the value as an Option.
     * @returns An Option containing the value if the result is Ok, otherwise an empty Option.
     */
    ok(): Option<T> {
        if (this.#state === State.Ok) {
            return new Option(this.#value);
        }

        return new Option();
    }

    /**
     * Returns the error as an Option.
     * @returns An Option containing the error if the result is an error, otherwise an empty Option.
     */
    error(): Option<E> {
        if (this.#state === State.Err) {
            return new Option(this.#error);
        }

        return new Option();
    }

    /**
     * Returns the result of `other` if the result is Ok, otherwise returns the current error.
     * @typeparam U - The type of the value in the other result.
     * @param other - The other result.
     * @returns The other result if the current result is Ok, otherwise a new result with the current error.
     */
    and<U>(other: Result<U, E>): Result<U, E> {
        if (this.#state === State.Ok) {
            return other;
        }

        return new Result<U, E>(undefined, this.#error);
    }

    /**
     * Calls the provided function with the value if the result is Ok, otherwise returns a new result with the current error.
     * @typeparam U - The type of the value returned by the function.
     * @param fn - The function to call with the value.
     * @returns The result of the function if the current result is Ok, otherwise a new result with the current error.
     */
    andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
        if (this.#state === State.Err) {
            return new Result<U, E>(undefined, this.#error);
        }

        return fn(this.#value!);
    }

    /**
     * Returns the current result if it is Ok, otherwise returns the other result.
     * @param other - The other result.
     * @returns The current result if it is Ok, otherwise the other result.
     */
    or(other: Result<T, E>): Result<T, E> {
        if (this.#state === State.Ok) {
            return this;
        }

        return other;
    }

    /**
     * Calls the provided function with the error if the result is an error, otherwise returns the current result.
     * @param fn - The function to call with the error.
     * @returns The current result if it is Ok, otherwise the result of the function.
     */
    orElse(fn: (error: E) => Result<T, E>): Result<T, E> {
        if (this.#state === State.Ok) {
            return this;
        }

        return fn(this.#error!);
    }

    /**
     * Checks if the condition specified by the provided function is true.
     *
     * @param fn - The function that specifies the condition to check.
     * @returns `true` if the condition is true, `false` otherwise.
     */
    if(fn: (value: T) => boolean): boolean {
        if (this.#state === State.Ok) {
            return fn(this.#value!);
        }

        return false;
    }

    /**
     * Returns the value of the result as an array.
     * If the result is in the Ok state, the value is wrapped in an array and returned.
     * If the result is in any other state, an empty array is returned.
     *
     * @returns An array containing the value of the result, or an empty array.
     */
    asArray(): T[] {
        if (this.#state === State.Ok) {
            return [this.#value!];
        }

        return [];
    }

    /**
     * Resolves the promise with the stored value if the state is `Ok`,
     * otherwise rejects the promise with the stored error.
     *
     * @returns A promise that resolves with the stored value or rejects with the stored error.
     */
    resolve(): Promise<T> {
        return this.#state === State.Ok
            ? Promise.resolve<T>(this.#value!)
            : Promise.reject<T>(this.#error!);
    }

    /**
     * Unwraps the value if the result is Ok, otherwise throws a ResultError with the error message.
     * @returns The unwrapped value.
     * @throws ResultError if the result is an error.
     */
    unwrap(): T {
        if (this.#state === State.Err) {
            if (this.#error instanceof Error) {
                throw new ResultError(`Result is error ${this.#error.message}`, this.#error);
            }

            throw new ResultError(`Result is error ${this.#error}`);
        }

        return this.#value!;
    }

    /**
     * Unwraps the value if the result is Ok, otherwise returns the provided default value.
     * @param defaultValue - The default value to return if the result is an error.
     * @returns The unwrapped value if the result is Ok, otherwise the default value.
     */
    unwrapOr(defaultValue: T): T {
        if (this.#state === State.Ok) {
            return this.#value!;
        }

        return defaultValue;
    }

    /**
     * Unwraps the value if the result is Ok, otherwise calls the provided function and returns its result.
     * @param fn - The function to call if the result is an error.
     * @returns The unwrapped value if the result is Ok, otherwise the result of the function.
     */
    unwrapOrElse(fn: () => T): T {
        if (this.#state === State.Ok) {
            return this.#value!;
        }

        return fn();
    }

    /**
     * Unwraps the error if the result is an error, otherwise throws an Error with the message "Result is Ok".
     * @returns The unwrapped error.
     * @throws Error if the result is Ok.
     */
    unwrapError(): E {
        if (this.#state === State.Ok) {
            throw new ResultError("Result is Ok");
        }
        return this.#error!;
    }

    /**
     * Calls the provided function with the value if the result is Ok.
     * @param fn - The function to call with the value.
     * @returns The current result.
     */
    inspect(fn: (value: T) => void): Result<T, E> {
        if (this.#state === State.Ok) {
            fn(this.#value!);
        }

        return this;
    }

    /**
     * Expects the result to be Ok, otherwise throws an Error with the provided message.
     * @param message - The error message to throw.
     * @returns The unwrapped value.
     * @throws Error if the result is an error.
     */
    expect(message: string): T {
        if (this.#state === State.Err) {
            throw new ResultError(message);
        }
        return this.#value!;
    }

    /**
     * Expects the result to be an error, otherwise throws an Error with the provided message.
     * @param message - The error message to throw.
     * @returns The unwrapped error.
     * @throws Error if the result is Ok.
     */
    expectError(message: string): E {
        if (this.#state === State.Ok) {
            throw new ResultError(message);
        }
        return this.#error!;
    }

    /**
     * Maps the value of the result to a new value using the provided function if the result is Ok, otherwise returns a new result with the current error.
     * @typeparam U - The type of the new value.
     * @param fn - The function to map the value.
     * @returns A new result with the mapped value if the current result is Ok, otherwise a new result with the current error.
     */
    map<U>(fn: (value: T) => U): Result<U, E> {
        if (this.#state === State.Err) {
            return new Result<U, E>(undefined, this.#error);
        }

        return new Result(fn(this.#value!));
    }

    /**
     * Maps the value of the result to a new value using the provided function if the result is Ok, otherwise returns the provided default value.
     * @typeparam U - The type of the new value.
     * @param defaultValue - The default value to return if the result is an error.
     * @param fn - The function to map the value.
     * @returns The mapped value if the result is Ok, otherwise the default value.
     */
    mapOr<U>(defaultValue: U, fn: (value: T) => U): U {
        if (this.#state === State.Err) {
            return defaultValue;
        }

        return fn(this.#value!);
    }

    /**
     * Maps the value of the result to a new value using the provided function if the result is Ok, otherwise calls the provided default function and returns its result.
     * @typeparam U - The type of the new value.
     * @param defaultFn - The default function to call if the result is an error.
     * @param fn - The function to map the value.
     * @returns The mapped value if the result is Ok, otherwise the result of the default function.
     */
    mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U {
        if (this.#state === State.Err) {
            return defaultFn();
        }

        return fn(this.#value!);
    }

    /**
     * Maps the error of the result to a new error using the provided function if the result is an error, otherwise returns a new result with the current value.
     * @typeparam F - The type of the new error.
     * @param fn - The function to map the error.
     * @returns A new result with the current value if the current result is Ok, otherwise a new result with the mapped error.
     */
    mapError<F>(fn: (error: E) => F): Result<T, F> {
        if (this.#state === State.Ok) {
            return new Result(this.#value);
        }

        return new Result<T, F>(undefined, fn(this.#error!));
    }

    /**
     * Maps the error of the result to a new error using the provided function if the result is an error, otherwise returns the provided default error.
     * @typeparam F - The type of the new error.
     * @param defaultError - The default error to return if the result is Ok.
     * @param fn - The function to map the error.
     * @returns The mapped error if the result is an error, otherwise the default error.
     */
    mapErrorOr<F>(defaultError: F, fn: (error: E) => F): F {
        if (this.#state === State.Ok) {
            return defaultError;
        }

        return fn(this.#error!);
    }

    /**
     * Maps the error of the result to a new error using the provided function if the result is an error, otherwise calls the provided default function and returns its result.
     * @typeparam F - The type of the new error.
     * @param defaultFn - The default function to call if the result is Ok.
     * @param fn - The function to map the error.
     * @returns The mapped error if the result is an error, otherwise the result of the default function.
     */
    mapErrorOrElse<F>(defaultFn: () => F, fn: (error: E) => F): F {
        if (this.#state === State.Ok) {
            return defaultFn();
        }

        return fn(this.#error!);
    }
}

/**
 * Represents a successful result with a value of type `T`.
 * @typeparam T - The type of the value.
 */
export class Ok<T> extends Result<T, never> {
    /**
     * Creates a new instance of Ok.
     * @param value - The value of type `T`.
     */
    constructor(value: T) {
        super(value);
    }
}

/**
 * Represents an error result with an error of type `E`.
 * @typeparam E - The type of the error.
 */
export class Err<E = Error> extends Result<never, E> {
    /**
     * Creates a new instance of Err.
     * @param error - The error of type `E`.
     */
    constructor(error: E) {
        super(undefined, error);
    }
}

/**
 * Creates a new Ok result with the provided value.
 * @typeparam T - The type of the value.
 * @typeparam E - The type of the error.
 * @param value - The value of type `T`.
 * @returns A new Ok result.
 */
export function ok<T, E>(value: T): Result<T, E> {
    return new Ok(value);
}

/**
 * Creates a new Err result with the provided error.
 * @typeparam T - The type of the value.
 * @typeparam E - The type of the error.
 * @param error - The error of type `E`.
 * @returns A new Err result.
 */
export function fail<T = never, E = Error>(error: E): Result<T, E> {
    return new Err(error);
}

/**
 * Creates a result of Result<T> as an Err result and coerces the provided error 
 * to an Error if it is not already an Error.
 * @returns A new Err result with a value of error.
 */
export function coerceError<T = unknown>(error: Error): Result<T> {
    if (error instanceof Error) {
        return fail(error);
    }

    return fail(new Error(`${error}`));
}

/**
 * Creates a `Result<void>` a new Ok result with a value of `void`.
 * @returns A new Ok result with a value of `void`.
 */
export function voided(): Result<void> {
    return ok(void 0);
}

/**
 * Syncronously try to execute the provided function and return a result.
 * @param fn The function to execute
 * @returns The result of the function.
 */
export function tryCatchSync<T>(fn: () => T): Result<T, Error> {
    try {
        return ok(fn());
    } catch (error) {
        if (error instanceof Error) {
            return fail(error);
        }
        return fail(new Error(`${error}`));
    }
}

/**
 * Try to execute the provided function and return a result.
 * @param fn The function to execute
 * @returns The result of the function.
 */
export async function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
    try {
        const value = await fn();
        return ok(value);
    } catch (error) {
        if (error instanceof Error) {
            return fail(error);
        }
        return fail(new Error(`${error}`));
    }
}
