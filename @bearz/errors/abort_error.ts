/**
 * Represents an error that occurs when an operation is aborted.
 *
 * @extends {Error}
 *
 * @example
 * ```typescript
 * throw new AbortError("The operation was aborted.");
 * ```
 *
 * @example
 * ```typescript
 * try {
 *     // some operation that may throw an AbortError
 * } catch (e) {
 *     if (AbortError.is(e)) {
 *         console.error("Operation aborted:", e.message);
 *     }
 * }
 * ```
 *
 * @property {string} [link] - A URL linking to more information about the error.
 */
export class AbortError extends Error {
    /**
     * Creates a new instance of the `AbortError` class.
     * @param message The error message.
     * @param options The error options.
     */
    constructor(message?: string, options?: ErrorOptions) {
        super(message ?? "The operation was cancelled.", options);
        this.name = "AbortError";

        this.link = "https://jsr.io/@bearz/errors/docs/abort-error";
    }

    /**
     * A link to the documentation that provides more information about the error.
     */
    link?: string;

    /**
     * Determines if the specified object is an instance of `AbortError`.
     * @param e The object to check.
     * @returns `true` if the object is an instance of `AbortError`; otherwise, `false`.
     */
    static is(e: unknown): e is AbortError {
        return e instanceof AbortError || (e instanceof Error && e.name === "AbortError");
    }
}
