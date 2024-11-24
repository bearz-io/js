import type { LogLevel } from "./log_level.ts";

export interface MessageSink {
    (message: Message): void;
}

export interface Message extends Record<string, unknown> {
    kind: string;
}

export interface MessageBus {
    addListener(listener: MessageSink): void;
    removeListener(listener: MessageSink): void;
    send(message: Message): void;
}

export interface LoggingMessageBus extends MessageBus {
    enabled(level: LogLevel): boolean;

    setLevel(level: LogLevel): this;

    fatal(error: Error, message?: string, ...args: unknown[]): this;
    fatal(message: string, ...args: unknown[]): this;
    error(error: Error, message?: string, ...args: unknown[]): this;
    error(message?: string, ...args: unknown[]): this;
    warn(error: Error, message?: string, ...args: unknown[]): this;
    warn(message: string, ...args: unknown[]): this;
    info(error: Error, message?: string, ...args: unknown[]): this;
    info(message: string, ...args: unknown[]): this;
    debug(error: Error, message?: string, ...args: unknown[]): this;
    debug(message: string, ...args: unknown[]): this;
    trace(error: Error, message?: string, ...args: unknown[]): this;
    trace(message: string, ...args: unknown[]): this;
}
