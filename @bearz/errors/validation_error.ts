/**
 * Error for validation rule violations.
 */
export class ValidationError extends Error {
    /**
     * Constructs a new `ValidationError` instance.
     *
     * @param message - The error message.
     * @param options - Optional error options.
     */
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "ValidationError";
    }

    /**
     * Determines if the specified object is an instance of `ValidationError`.
     * @param e The object to check.
     * @returns `true` if the object is an instance of `ValidationError`; otherwise, `false`.
     */
    static is(e: unknown): e is ValidationError {
        return e instanceof ValidationError;
    }

    /**
     * The name of the rule that was violated.
     */
    rule?: string;

    /**
     * The value that caused the error.
     */
    value?: unknown;
}
