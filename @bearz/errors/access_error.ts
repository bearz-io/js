/**
 * Options for creating an `AccessError`.
 */
export interface AccessErrorOptions extends ErrorOptions {
    /**
     * The target of the access error.
     */
    target?: string;

    /**
     * The link to the access error.
     */
    link?: string;
}

/**
 * Error for access violations.
 */
export class AccessError extends Error {
    /**
     * Constructs a new `AccessError` instance.
     * @param options The error options.
     */
    constructor(options: AccessErrorOptions);
    /**
     * Constructs a new `AccessError` instance.
     *
     * @param message - The error message.
     * @param options - Optional error options.
     */
    constructor(message?: string, options?: AccessErrorOptions);
    constructor() {
        const [message, options] = arguments.length === 1 && typeof arguments[0] === "object"
            ? [undefined, arguments[0]]
            : arguments;
        super(message ?? "Access error.", options);
        this.name = "AccessError";
        this.target = options?.target;
        this.link = options?.link ?? "https://jsr.io/@bearz/errors/docs/access-error";
    }

    /**
     * The target of the access error.
     */
    target?: string;

    /**
     * Determines if the specified object is an instance of `AccessError`.
     */
    link?: string;

    /**
     * Checks if the specified object is an instance of `AccessError`.
     * @param e The object to check.
     * @returns `true` if the object is an instance of `AccessError`; otherwise, `false`.
     */
    static is(e: unknown): e is AccessError {
        return e instanceof AccessError || (e instanceof Error && e.name === "AccessError");
    }
}
