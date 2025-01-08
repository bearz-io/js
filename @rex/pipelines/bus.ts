import { type LoggingMessageBus, LogLevel, type Message, type MessageSink } from "@rex/primitives";

/**
 * Converts a log level to a string.
 * @param level The log level.
 * @returns The string representation of the log level.
 */
export function logLevelToString(level: LogLevel): string {
    switch (level) {
        case LogLevel.Trace:
            return "trace";
        case LogLevel.Debug:
            return "debug";
        case LogLevel.Info:
            return "info";
        case LogLevel.Warn:
            return "warn";
        case LogLevel.Error:
            return "error";
        case LogLevel.Fatal:
            return "fatal";
        default:
            return "unknown";
    }
}

/**
 * Represents a log message.
 */
export class LogMessage implements Message {
    /**
     * The error associated with the log message.
     */
    error?: Error;
    /**
     * The message to write.
     */
    message?: string;
    /**
     * The message arguments.
     */
    args?: unknown[];
    /**
     * The log level.
     */
    level: LogLevel;
    /**
     * The timestamp of the log message.
     */
    timestamp: Date = new Date();
    /**
     * The kind of message.
     */
    kind: string;

    /**
     * The properties of the log message.
     */
    [key: string | symbol]: unknown;

    /**
     * Creates a new instance of the `LogMessage` class.
     * @param level The log level.
     * @param error The error associated with the log message.
     * @param message The message to write.
     * @param args The message arguments.
     */
    constructor(level: LogLevel, error?: Error, message?: string, args?: unknown[]) {
        this.kind = "log";
        this.level = level;
        this.error = error;
        this.message = message;
        this.args = args;
    }
}

/**
 * The base message that all messages inherit from.
 */
export class BaseMessage implements Message {
    /**
     * Creates a new instance of the `BaseMessage` class.
     * @param kind The kind of message.
     */
    constructor(public readonly kind: string) {
    }

    [key: string | symbol]: unknown;
}

/**
 * The default logging message bus.
 */
export class DefaultLoggingMessageBus implements LoggingMessageBus {
    #level: LogLevel = LogLevel.Info;
    private listeners: MessageSink[] = [];

    /**
     * Adds a listener to the message bus.
     * @param listener The listener to add to the message bus.
     */
    addListener(listener: MessageSink): void {
        this.listeners.push(listener);
    }

    /**
     * Removes a listener from the message bus.
     * @param listener The listener to remove from the message bus.
     */
    removeListener(listener: MessageSink): void {
        const index = this.listeners.indexOf(listener);
        if (index >= 0) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * Sends a message to all listeners on the message bus.
     * @param message The message to send.
     */
    send(message: Message): void {
        this.listeners.forEach((listener) => listener(message));
    }

    /**
     * Determines if the log level is enabled.
     * @param level The log level.
     */
    enabled(level: LogLevel): boolean {
        return this.#level >= level;
    }

    /**
     * Sets the log level.
     * @param level The log level.
     * @returns The current instance of the message bus.
     */
    setLevel(level: LogLevel): this {
        this.#level = level;
        return this;
    }

    /**
     * Writes a fatal log message to the message bus.
     * @param error The error associated with the log message.
     * @param message The message to write.
     * @param args The message arguments.
     */
    fatal(error: Error, message?: string, ...args: unknown[]): this;
    /**
     * Writes a fatal log message to the message bus.
     * @param message The message to write.
     * @param args The message arguments.
     */
    fatal(message: string, ...args: unknown[]): this;
    fatal(): this {
        const first = arguments[0];
        let args: undefined | unknown[] = undefined;
        let message: undefined | string = undefined;
        let error: undefined | Error = undefined;
        if (first instanceof Error) {
            error = first;
            message = arguments[1];
            args = Array.prototype.slice.call(arguments, 2);
        } else {
            message = first;
            args = Array.prototype.slice.call(arguments, 1);
        }

        this.send(new LogMessage(LogLevel.Fatal, error, message, args));
        return this;
    }

    /**
     * Writes an error log message to the message bus.
     * @param error The error associated with the log message.
     * @param message The message to write.
     * @param args The message arguments.
     */
    error(error: Error, message?: string, ...args: unknown[]): this;
    /**
     * Writes a warning log message to the message bus.
     * @param message The message to write.
     * @param args The message arguments.
     */
    error(message: string, ...args: unknown[]): this;
    error(): this {
        const first = arguments[0];
        let args: undefined | unknown[] = undefined;
        let message: undefined | string = undefined;
        let error: undefined | Error = undefined;
        if (first instanceof Error) {
            error = first;
            message = arguments[1];
            args = Array.prototype.slice.call(arguments, 2);
        } else {
            message = first;
            args = Array.prototype.slice.call(arguments, 1);
        }

        this.send(new LogMessage(LogLevel.Error, error, message, args));
        return this;
    }

    /**
     * Writes a warning log message to the message bus.
     * @param error The error associated with the log message.
     * @param message The message to write.
     * @param args The message arguments.
     */
    warn(error: Error, message?: string, ...args: unknown[]): this;
    /**
     * Writes a warning log message to the message bus.
     * @param message The message to write.
     * @param args The message arguments.
     */
    warn(message: string, ...args: unknown[]): this;
    warn(): this {
        const first = arguments[0];
        let args: undefined | unknown[] = undefined;
        let message: undefined | string = undefined;
        let error: undefined | Error = undefined;
        if (first instanceof Error) {
            error = first;
            message = arguments[1];
            args = Array.prototype.slice.call(arguments, 2);
        } else {
            message = first;
            args = Array.prototype.slice.call(arguments, 1);
        }

        this.send(new LogMessage(LogLevel.Warn, error, message, args));
        return this;
    }

    /**
     * Writes an information log message to the message bus.
     * @param error The error associated with the log message.
     * @param message The message to write.
     * @param args The message arguments.
     */
    info(error: Error, message?: string, ...args: unknown[]): this;
    /**
     * Writes an information log message to the message bus.
     * @param message The message to write.
     * @param args The message arguments
     * @returns The current instance of the message bus.
     */
    info(message: string, ...args: unknown[]): this;
    info(): this {
        const first = arguments[0];
        let args: undefined | unknown[] = undefined;
        let message: undefined | string = undefined;
        let error: undefined | Error = undefined;
        if (first instanceof Error) {
            error = first;
            message = arguments[1];
            args = Array.prototype.slice.call(arguments, 2);
        } else {
            message = first;
            args = Array.prototype.slice.call(arguments, 1);
        }

        this.send(new LogMessage(LogLevel.Info, error, message, args));
        return this;
    }

    /**
     * Writes a debug log message to the message bus.
     * @param error The error associated with the log message.
     * @param message The message to write.
     * @param args The message arguments.
     */
    debug(error: Error, message?: string, ...args: unknown[]): this;
    /**
     * Writes a debug log message to the message bus.
     * @param message The message to write.
     * @param args The message arguments.
     */
    debug(message: string, ...args: unknown[]): this;
    debug(): this {
        const first = arguments[0];
        let args: undefined | unknown[] = undefined;
        let message: undefined | string = undefined;
        let error: undefined | Error = undefined;
        if (first instanceof Error) {
            error = first;
            message = arguments[1];
            args = Array.prototype.slice.call(arguments, 2);
        } else {
            message = first;
            args = Array.prototype.slice.call(arguments, 1);
        }

        this.send(new LogMessage(LogLevel.Debug, error, message, args));
        return this;
    }

    /**
     * Writes a trace log message to the message bus.
     * @param error The error associated with the log message.
     * @param message The message to write.
     * @param args The message arguments.
     */
    trace(error: Error, message?: string, ...args: unknown[]): this;
    /**
     * Writes a trace log message to the message bus.
     * @param message The message to write.
     * @param args The message arguments.
     */
    trace(message: string, ...args: unknown[]): this;
    trace(): this {
        const first = arguments[0];
        let args: undefined | unknown[] = undefined;
        let message: undefined | string = undefined;
        let error: undefined | Error = undefined;
        if (first instanceof Error) {
            error = first;
            message = arguments[1];
            args = Array.prototype.slice.call(arguments, 2);
        } else {
            message = first;
            args = Array.prototype.slice.call(arguments, 1);
        }

        this.send(new LogMessage(LogLevel.Trace, error, message, args));
        return this;
    }
}
