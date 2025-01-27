/**
 * Represents additional options for an `ArgumentError`.
 */
export interface ArgumentErrorOptions extends ErrorOptions {
    /**
     * The name of the target argument that caused the error.
     */
    target?: string;

    /**
     * The value of the parameter that caused the error.
     */
    value?: unknown;

    /**
     * A link to the documentation that provides more information about the error.
     */
    link?: string;
}

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
 * import { ArgumentError } from "@bearz/errors/argument";
 *
 * throw new ArgumentError("username", "Username cannot be empty");
 * ```
 *
 * @public
 */
export class ArgumentError extends Error {
    /**
     * Constructs a new `ArgumentError` instance.
     * @param options The error options.
     */
    constructor(options: ArgumentErrorOptions);
    /**
     * Constructs a new `ArgumentError` instance.
     *
     * @param message - Optional. A custom error message. If not provided, a default message will be used.
     * @param options - Optional. Additional options for the error.
     */
    constructor(message?: string, options?: ArgumentErrorOptions);
    constructor() {
        const [message, options] = arguments.length === 1 && typeof arguments[0] === "object"
            ? [undefined, arguments[0]]
            : arguments;
        super(
            message ?? `Invalid argument${(options?.target ? (" " + options.target) : "")}.`,
            options,
        );
        this.name = "ArgumentError";
        this.target = options?.target;
        this.value = options?.value;
        this.link = options?.link ?? "https://jsr.io/@bearz/errors/docs/argument-error";
    }

    /**
     * Determines if the specified object is an instance of `ArgumentError`.
     * @param e The object to check.
     * @returns `true` if the object is an instance of `ArgumentError`; otherwise, `false`.
     */
    static is(e: unknown): e is ArgumentError {
        return e instanceof ArgumentError || (e instanceof Error && e.name === "ArgumentError");
    }

    /**
     * The name of the target argument that caused the error.
     */
    target?: string;

    /**
     * The value of the parameter that caused the error.
     */
    value?: unknown;

    /**
     * A link to the documentation that provides more information about the error.
     */
    link?: string;
}

/**
 * Throws an `ArgumentError` with the specified message.
 * @param name The name of the target argument that caused the error.
 * @param message The error message.
 * @param options The error options.
 * @throws `ArgumentError` with the specified message.
 */
export function argumentError(
    name: string,
    message?: string,
    options?: ArgumentErrorOptions,
): never {
    throw new ArgumentError(message, { ...options, target: name });
}

/**
 * Throws an `ArgumentError` with a message indicating that the specified argument cannot be null or undefined.
 * @param name The name of the target argument that caused the error.
 * @throws `ArgumentError` with a message indicating that the specified argument cannot be null or undefined.
 */
export function throwOnNull(name: string): never {
    throw new ArgumentError(`Argument ${name} cannot be null or undefined.`, { target: name });
}

/**
 * Throws an `ArgumentError` with a message indicating that the specified argument cannot be empty.
 * @param name The name of the target argument that caused the error.
 * @throws `ArgumentError` with a message indicating that the specified argument cannot be empty.
 */
export function throwOnEmpty(name: string): never {
    throw new ArgumentError(`Argument ${name} cannot be empty.`, { target: name });
}
