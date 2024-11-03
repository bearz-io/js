/**
 * Represents an error that occurs when executing a command.
 */
export interface CommandErrorOptions extends ErrorOptions {
    /**
     * The exit code of the command.
     */
    code?: number;
    /**
     * The name of the command.
     */
    fileName?: string;
    /**
     * The arguments passed to the command.
     */
    args?: string[];
    /**
     * The descriptor of the target when the error occurred.
     */
    target?: string;
    /**
     * A link to more information about the error.
     */
    link?: string;
    /**
     * The error message.
     */
    message?: string;

    /**
     * The underlying cause of the error.
     */
    cause?: Error;
}

/**
 * Represents an error that occurs when executing a command.
 */
export class CommandError extends Error {
    /**
     * The exit code of the command.
     */
    exitCode?: number;
    /**
     * The name of the command.
     */
    fileName?: string;
    /**
     * The arguments passed to the command.
     */
    args?: string[];
    /**
     * The descriptor of the target when the error occurred.
     */
    target?: string;
    /**
     * A link to more information about the error.
     */
    link?: string;

    /**
     * Creates a new instance of the CommandError class.
     * @param options The options for the error.
     */
    constructor(options: CommandErrorOptions);
    /**
     * Creates a new instance of the CommandError class.
     * @param message The error message.
     */
    constructor(message?: string);
    /**
     * Creates a new instance of the CommandError class.
     */
    constructor() {
        const arg = arguments.length === 1 ? arguments[0] : undefined;
        const options: CommandErrorOptions = typeof arg === "object" ? arguments[0] : {};
        const message = typeof arg === "string" ? arguments[0] : options.message;

        super(
            message ?? `Command ${options?.fileName} failed with exit code ${options?.code}`,
            options,
        );
        this.name = "CommandError";
        this.exitCode = options.code;
        this.fileName = options.fileName;
        this.args = options.args;
        this.target = options.target;
        this.link = options.link ?? "https://jsr.io/@bearz/exec/doc/errors/~/CommandError";
    }
}

/**
 * Represents an error that occurs when a command is not found on the PATH.
 */
export interface NotFoundOnPathErrorOptions extends ErrorOptions {
    /**
     * The name or path of the command that was not found.
     */
    exe?: string;
    /**
     * The descriptor of the target when the error occurred.
     */
    target?: string;

    /**
     * A link to more information about the error.
     */
    link?: string;

    /**
     * The error message.
     */
    message?: string;

    /**
     * The underlying cause of the error.
     */
    cause?: Error;
}

export class NotFoundOnPathError extends Error {
    /**
     * The descriptor of the target when the error occurred.
     */
    target?: string;
    /**
     * A link to more information about the error.
     */
    link?: string;
    /**
     * The name or path of the command that was not found.
     */
    exe?: string;

    /**
     * Creates a new instance of the NotFoundOnPathError class.
     * @param options The options for the error.
     */
    constructor(options: NotFoundOnPathErrorOptions);
    /**
     * Creates a new instance of the NotFoundOnPathError class.
     * @param message The error message.
     */
    constructor(message: string);
    /**
     * Creates a new instance of the NotFoundOnPathError class.
     */
    constructor();
    constructor() {
        const arg = arguments.length === 1 ? arguments[0] : undefined;
        const options: NotFoundOnPathErrorOptions = typeof arg === "object" ? arguments[0] : {};
        const message = typeof arg === "string" ? arguments[0] : options.message;
        super(message ?? `Executable ${options.exe} not found on environment PATH.`, options);
        this.name = "NotFoundOnPathError";
        this.target = options.target;
        this.link = options.link ?? "https://jsr.io/@bearz/exec/doc/errors/~/NotFoundOnPathError";
        this.exe = options.exe;
    }
}
