/**
 * Error options.
 */
export interface NotFoundErrorOptions extends ErrorOptions {
    /**
     * The resource that was not found.
     */
    resource?: string;
}

/**
 * Resource not found error.
 */
export class NotFoundError extends Error {
    /**
     * Creates a new instance of the `NotFoundError`.
     * @param options The error options.
     */
    constructor(options?: NotFoundErrorOptions);
    /**
     * Creates a new instance of the `NotFoundError`.
     * @param resource The resource that was not found.
     * @param message The error message.
     * @param options Additional options for the error.
     */
    constructor(message: string, options?: NotFoundErrorOptions);
    constructor() {
        const [message, options] = arguments.length === 1 && typeof arguments[0] === "object"
            ? [undefined, arguments[0]]
            : arguments;
        super(
            message ?? `Resource ${(options?.resource ? (options.resource + " ") : "")}not found.`,
            options,
        );
        this.name = "NotFoundError";
        this.resource = options?.resource;
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
