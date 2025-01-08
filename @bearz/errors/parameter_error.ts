/**
 * Represents an error that occurs due to an invalid parameter.
 *
 * @remarks
 * This error is thrown when a function or method receives an invalid parameter.
 * It extends the built-in `Error` class and provides additional properties
 * to store the parameter name, value, and a documentation link.
 *
 * @example
 * ```typescript
 * throw new ParameterError("username", "Username cannot be empty");
 * ```
 *
 * @public
 */
export class ParameterError extends Error {
    /**
     * Constructs a new `ParameterError` instance.
     *
     * @param name - The name of the parameter that caused the error.
     * @param message - Optional. A custom error message. If not provided, a default message will be used.
     * @param options - Optional. Additional options for the error.
     */
    constructor(name: string, message?: string, options?: ErrorOptions) {
        super(message ?? `Invalid parameter ${name}`, options);
        this.name = "ArgumentError";
        this.paramName = name;

        this.link = "https://jsr.io/@bearz/errors/docs/argument-error";
    }

    /**
     * Determines if the specified object is an instance of `ParameterError`.
     * @param e The object to check.
     * @returns `true` if the object is an instance of `ParameterError`; otherwise, `false`.
     */
    static is(e: unknown): e is ParameterError {
        return e instanceof ParameterError || (e instanceof Error && e.name === "ArgumentError");
    }

    /**
     * The name of the parameter that caused the error.
     */
    paramName?: string;

    /**
     * The value of the parameter that caused the error.
     */
    value?: unknown;

    /**
     * A link to the documentation that provides more information about the error.
     */
    link?: string;
}
