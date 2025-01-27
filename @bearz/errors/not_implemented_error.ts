/**
 * The options for the `NotImplementedError` class.
 */
export interface NotImplementedErrorOptions extends ErrorOptions {
    /**
     * The target of the not implemented error.
     */
    target?: string;

    /**
     * The link to the not implemented error.
     */
    link?: string;
}

/**
 * Error for not implemented features.
 */
export class NotImplementedError extends Error {
    /**
     * Creates a new instance of the `NotImplementedError` class.
     * @param options The error options.
     */
    constructor(options?: NotImplementedErrorOptions);
    /**
     * Creates a new instance of the `NotImplementedError` class.
     *
     * @param message - The error message.
     * @param options - Optional error options.
     */
    constructor(message?: string, options?: NotImplementedErrorOptions);
    constructor() {
        const [message, options] = arguments.length === 1 && typeof arguments[0] === "object"
            ? [undefined, arguments[0]]
            : arguments;
        super(
            message ?? `Feature ${(options?.target ? (options.target + " ") : "")}not implemented.`,
            options,
        );
        this.name = "NotImplementedError";
        this.target = options?.target;
        this.link = options?.link ?? "https://jsr.io/@bearz/errors/docs/not-implemented-error";
    }

    /**
     * The target of the not implemented error.
     */
    target?: string;

    /**
     * Determines if the specified object is an instance of `NotImplementedError`.
     */
    link?: string;

    /**
     * Checks if the specified object is an instance of `NotImplementedError`.
     * @param e The object to check.
     * @returns `true` if the object is an instance of `NotImplementedError`; otherwise, `false`.
     */
    static is(e: unknown): e is NotImplementedError {
        return e instanceof NotImplementedError ||
            (e instanceof Error && e.name === "NotImplementedError");
    }
}

/**
 * Throws a `NotImplementedError` for the specified feature.
 * @param message The error message.
 * @throws `NotImplementedError` with the specified message.
 */
export function featureNotImplemented(name?: string): never {
    throw new NotImplementedError({ target: name });
}

/**
 * Throws a `NotImplementedError` for the specified function.
 * @param name The name of the target argument that caused the error.
 * @throws `NotImplementedError` with the specified message.
 */
export function functionNotImplemented(name?: string): never {
    throw new NotImplementedError(`Function ${name} is not implemented.`, { target: name });
}
