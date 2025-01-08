/**
 * Represents an error that occurs when an operation times out.
 */
export class TimeoutError extends Error {
    /**
     * Constructs a new `TimeoutError` instance.
     *
     * @param message - The error message.
     * @param options - Optional error options.
     */
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "TimeoutError";
    }

    /**
     * The timeout value that caused the error.
     */
    timeout?: number;

    /**
     * Determines if the specified object is an instance of `TimeoutError`.
     * @param e The object to check.
     * @returns `true` if the object is an instance of `TimeoutError`; otherwise, `false`.
     */
    static is(e: unknown): e is TimeoutError {
        return e instanceof TimeoutError;
    }
}
