/**
 * Represents the options for creating an error.
 */
export interface TimeoutErrorOptions extends ErrorOptions {
    /**
     * The timeout value that caused the error.
     */
    timeout?: number;

    /**
     * The target of the error.
     */
    target?: string;

    /**
     * The link to help information about the error.
     */
    link?: string;
}

/**
 * Represents an error that occurs when an operation times out.
 */
export class TimeoutError extends Error {
    /**
     * Creates a new instance of the `TimeoutError` class.
     * @param options The error options.
     */
    constructor(options?: TimeoutErrorOptions);
    /**
     * Creates a new instance of the `TimeoutError` class.
     * @param message The error message.
     * @param options The error options.
     */
    constructor(message?: string, options?: TimeoutErrorOptions);
    constructor() {
        const [message, options] = arguments.length === 1 && typeof arguments[0] === "object"
            ? [undefined, arguments[0]]
            : arguments;
        super(
            message ?? `Operation ${(options?.target ? (options.target + " ") : "")}timed out.`,
            options,
        );
        this.name = "TimeoutError";
        this.timeout = options?.timeout;
        this.link = options?.link;
        this.target = options?.target;
    }

    /**
     * Determines if the specified object is an instance of `TimeoutError`.
     * @param e The object to check.
     * @returns `true` if the object is an instance of `TimeoutError`; otherwise, `false`.
     */
    static is(e: unknown): e is TimeoutError {
        return e instanceof TimeoutError;
    }

    /**
     * The target of the error.
     */
    target?: string;

    /**
     * The timeout value that caused the error.
     */
    timeout?: number;

    /**
     * The link to help information about the error.
     */
    link?: string;
}
