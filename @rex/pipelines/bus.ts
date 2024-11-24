import type { LoggingMessageBus, Message, MessageSink } from "@rex/primitives/bus";
import { LogLevel } from "@rex/primitives/log-level";

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

export class LogMessage implements Message {
    error?: Error;
    message?: string;
    args?: unknown[];
    level: LogLevel;
    timestamp: Date = new Date();
    kind: string;

    [key: string]: unknown;

    constructor(level: LogLevel, error?: Error, message?: string, args?: unknown[]) {
        this.kind = "log";
        this.level = level;
        this.error = error;
        this.message = message;
        this.args = args;
    }
}

export class BaseMessage implements Message {
    constructor(public readonly kind: string) {
    }

    [key: string]: unknown;
}

export class DefaultLoggingMessageBus implements LoggingMessageBus {
    #level: LogLevel = LogLevel.Info;
    private listeners: MessageSink[] = [];

    addListener(listener: MessageSink): void {
        this.listeners.push(listener);
    }

    removeListener(listener: MessageSink): void {
        const index = this.listeners.indexOf(listener);
        if (index >= 0) {
            this.listeners.splice(index, 1);
        }
    }

    send(message: Message): void {
        this.listeners.forEach((listener) => listener(message));
    }

    enabled(level: LogLevel): boolean {
        return this.#level >= level;
    }

    setLevel(level: LogLevel): this {
        this.#level = level;
        return this;
    }

    fatal(error: Error, message?: string, ...args: unknown[]): this;
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

    error(error: Error, message?: string, ...args: unknown[]): this;
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

    warn(error: Error, message?: string, ...args: unknown[]): this;
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

    info(error: Error, message?: string, ...args: unknown[]): this;
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

    debug(error: Error, message?: string, ...args: unknown[]): this;
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

    trace(error: Error, message?: string, ...args: unknown[]): this;
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
