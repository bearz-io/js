/**
 * A potentially fatal error that should generally halt the execution of the program
 * or at least the current operation.
 */
export class PanicError extends Error {
    /**
     * Creates a new instance of the `PanicError`.
     * @param message The error message.
     * @param options The error options.
     */
    constructor(message?: string, options?: ErrorOptions) {
        super(message ?? "An unexpected error occurred.", options);
        this.name = "PanicError";
    }

    /**
     * Determines if the value is a `PanicError`.
     * @param value The value to check.
     * @returns `true` if the value is a `PanicError`, otherwise `false`.
     */
    static is(value: unknown): value is PanicError {
        return value instanceof PanicError ||
            (value instanceof Error && value.name === "PanicError");
    }
}
