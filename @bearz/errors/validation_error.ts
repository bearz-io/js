/**
 * Options for creating a validation error.
 */
export interface ValidationErrorOptions extends ErrorOptions {
    /**
     * The target of the validation error.
     */
    target?: string;
    /**
     * The name of the rule that was violated.
     */
    rule?: string;
    /**
     * The value that caused the error.
     */
    value?: unknown;
}

/**
 * Error for validation rule violations.
 */
export class ValidationError extends Error {
    /**
     * Create a new `ValidationError` instance.
     * @param options The error options.
     */
    constructor(options?: ValidationErrorOptions);
    /**
     * Create a new `ValidationError` instance.
     *
     * @param message - The error message.
     * @param options - Optional error options.
     */
    constructor(message?: string, options?: ValidationErrorOptions);
    constructor() {
        const [message, options] = arguments.length === 1 && typeof arguments[0] === "object"
            ? [undefined, arguments[0]]
            : arguments;
        super(message ?? `${(options?.target ? (options.target) : "Rule")} is invalid.`, options);
        this.name = "ValidationError";
        this.rule = options?.rule;
        this.target = options?.target;
        this.value = options?.value;
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
     * The target of the validation error.
     */
    target?: string;

    /**
     * The name of the rule that was violated.
     */
    rule?: string;

    /**
     * The value that caused the error.
     */
    value?: unknown;
}
