/**
 * Represents an error that occurs when a file or directory already exists.
 */
export class AlreadyExistsError extends Error {
    /** Constructs a new instance. */
    constructor(message: string, innerError?: Error) {
        super(message, innerError);
        this.name = "AlreadyExistsError";
    }
}

export class NotFoundError extends Error {
    /** Constructs a new instance. */
    constructor(message: string, innerError?: Error) {
        super(message, innerError);
        this.name = "NotFoundError";
    }
}

/**
 * Error thrown in {@linkcode move} or {@linkcode moveSync} when the
 * destination is a subdirectory of the source.
 */
export class SubdirectoryMoveError extends Error {
    /** Constructs a new instance. */
    constructor(src: string | URL, dest: string | URL) {
        super(
            `Cannot move '${src}' to a subdirectory of itself, '${dest}'.`,
        );
        this.name = this.constructor.name;
    }
}
