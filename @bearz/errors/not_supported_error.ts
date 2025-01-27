/**
 * Represents the options for the `NotSupportedError`.
 */
export interface NotSupportedErrorOptions extends ErrorOptions {
    /**
     * The target of the not supported error.
     */
    target?: string;

    /**
     * The link to the not supported error.
     */
    link?: string;
}

/**
 * Represents an error that occurs when an operation or platform
 * is not supported.
 */
export class NotSupportedError extends Error {
    /**
     * Creates a new instance of the `NotSupportedError`.
     * @param options The error options.
     */
    constructor(options?: NotSupportedErrorOptions);
    /**
     * Creates a new instance of the `NotSupportedError`.
     * @param message The error message.
     * @param options The error options.
     */
    constructor(message?: string, options?: NotSupportedErrorOptions);
    constructor() {
        const [message, options] = arguments.length === 1 && typeof arguments[0] === "object"
            ? [undefined, arguments[0]]
            : arguments;
        super(
            message ?? `Platform ${(options?.target ? (options.target + " ") : "")}not supported.`,
            options,
        );
        this.name = "NotSupportedError";
        this.target = options?.target;
        this.link = options?.link ?? "https://jsr.io/@bearz/errors/docs/not-supported-error";
    }

    /**
     * Determines if the specified object is an instance of `NotSupportedError`.
     * @param e The object to check.
     * @returns `true` if the object is an instance of `NotSupportedError`; otherwise, `false`.
     */
    static is(e: unknown): e is NotSupportedError {
        return e instanceof NotSupportedError;
    }

    /**
     * The target of the not supported error.
     */
    target?: string;

    /**
     * The link to the not supported error.
     */
    link?: string;
}
