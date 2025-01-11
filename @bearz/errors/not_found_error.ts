/**
 * Resource not found error.
 */
export class NotFoundError extends Error {
    /**
     * Creates a new instance of the NotFoundError.
     * @param resource The resource that was not found.
     * @param message The error message.
     * @param options Additional options for the error.
     */
    constructor(resource: string, message?: string, options?: ErrorOptions) {
        super(message ?? `Resource ${resource} not found.`, options);
        this.name = "NotFoundError";
        this.resource = resource;
    }

    /**
     * The resource that was not found.
     */
    resource?: string;

    /**
     * Determines if the value is a `NotFoundError`.
     * @param value The value to check.
     * @returns `true` if the value is a `NotFoundError`, otherwise `false`.
     */
    static is(value: unknown): value is NotFoundError {
        return value instanceof NotFoundError ||
            (value instanceof Error && value.name === "NotFoundError");
    }
}
