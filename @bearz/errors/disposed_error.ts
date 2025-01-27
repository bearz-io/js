/**
 * The options for the disposed error.
 */
export interface DisposedErrorOptions extends ErrorOptions {
    /**
     * The target of the disposed error.
     */
    target?: string;

    /**
     * The link to the disposed error.
     */
    link?: string;
}

/**
 * Error for disposed resources.
 */
export class DisposedError extends Error {
    /**
     * Creates a new `DisposedError` instance.
     *
     * @param message - The error message.
     * @param options - Optional error options.
     */
    constructor(options: DisposedErrorOptions);
    /**
     * Creates a new `DisposedError` instance.
     * @param message The error message.
     * @param options The error options.
     */
    constructor(message?: string, options?: DisposedErrorOptions);
    constructor() {
        const [message, options] = arguments.length === 1 && typeof arguments[0] === "object"
            ? [undefined, arguments[0]]
            : arguments;
        super(
            message ?? `Object ${(options?.target ? (options.target + " ") : "")}already disposed.`,
            options,
        );
        this.name = "DisposedError";
        this.target = options?.target;
        this.link = options?.link ?? "https://jsr.io/@bearz/errors/docs/disposed-error";
    }

    /**
     * The target of the disposed error.
     */
    target?: string;

    /**
     * Determines if the specified object is an instance of `DisposedError`.
     */
    link?: string;
}
