import type { ObjectMap } from "./collections/object_map.ts";
import type { Outputs } from "./collections/outputs.ts";
import type { ProxyMap } from "./collections/proxy_map.ts";
import type { StringMap } from "./collections/string_map.ts";
import type { Lookup } from "./lookup.ts";
import type { AnsiLogLevel, AnsiWriter } from "@bearz/ansi";
import type { SecretMasker } from "@bearz/secrets";

/** Primitive types used in the pipeline */
export type PipelinePrimitives =
    | "string"
    | "number"
    | "boolean"
    | "integer"
    | "bigint"
    | "array"
    | "object"
    | "date";

/**
 * Describes an input parameter.
 */
export interface InputDescriptor {
    /**
     * The name of the input parameter.
     */
    name: string;
    /**
     * The description of the input parameter.
     */
    description?: string;
    /**
     * The type of the input parameter.
     */
    type: PipelinePrimitives;
    /**
     * Indicates if the input parameter is required.
     */
    required?: boolean;
    /**
     * The default value of the input parameter.
     */
    default?: unknown;
    /**
     * Indicates if the input parameter is a secret.
     */
    secret?: boolean;
}

/**
 * Describes an output parameter.
 */
export interface OutputDescriptor {
    /**
     * The name of the output parameter.
     */
    name: string;
    /**
     * The description of the output parameter.
     */
    description?: string;
    /**
     * The type of the output parameter.
     */
    required?: boolean;
    /**
     * The type of the output parameter.
     */
    type: PipelinePrimitives;
}

/**
 * The specialized writer for rex that inherits from the ANSI writer.
 */
export interface RexWriter extends AnsiWriter {
    /**
     * The secret masker used to mask secrets in the output.
     */
    readonly secretMasker: SecretMasker;

    /**
     * Writes a masked value to the output.
     * @param value The value to mask.
     */
    mask(value: string): this;

    /**
     * Writes a masked value to the output as a line.
     * @param value The value to mask.
     */
    maskLine(value: string): this;

    /**
     * Determines if the log level is enabled.
     * @param level The log level.
     */
    enabled(level: LogLevel | AnsiLogLevel): boolean;

    /**
     * Sets the log level.
     * @param level The log level.
     */
    setLogLevel(level: LogLevel): this;

    /**
     * Skips a group of messages.
     * @param name The group name.
     */
    skipGroup(name: string): this;

    /**
     * Writes an warning message to the output.
     * @param e The error.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    debug(e: Error, message?: string, ...args: unknown[]): this;

    /**
     * Writes an warning message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    debug(message: string, ...args: unknown[]): this;

    /**
     * Writes an warning message to the output.
     * @param e The error.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    info(e: Error, message?: string, ...args: unknown[]): this;

    /**
     * Writes an warning message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    info(message: string, ...args: unknown[]): this;

    /**
     * Writes an warning message to the output.
     * @param e The error.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    trace(e: Error, message?: string, ...args: unknown[]): this;

    /**
     * Writes an warning message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    trace(message: string, ...args: unknown[]): this;
}

/**
 * The context object that is passed to each function invocation.
 */
export interface Context extends Lookup {
    /**
     * The signal that can be used to abort the function invocation.
     */
    signal: AbortSignal;
    /**
     * Environment variables available to the function invocation.
     */
    env: StringMap;
    /**
     * Variables available to the function invocation.
     */
    variables: ObjectMap;
    /**
     * The output parameters of the function invocation.
     */
    writer: RexWriter;
    /**
     * Secrets available to the function invocation.
     */
    secrets: StringMap;
    /**
     * Services available to the function invocation.
     */
    services: ProxyMap<unknown>;
}

/**
 * The context object that is passed to each function invocation.
 */
export interface ExecutionContext extends Context {
    /**
     * The the outputs of the function invocation.
     */
    outputs: Outputs;

    /**
     * The current working directory of the function invocation
     */
    cwd: string;
}

/**
 * The log level for the message.
 */
export enum LogLevel {
    /**
     * A log level that is used for tracing messages.
     */
    Trace = 7,
    /**
     * A log level that is used for debugging messages.
     */
    Debug = 6,
    /**
     * A log level that is used for informational messages.
     */
    Info = 5,
    /**
     * A log level that is used for warning messages.
     */
    Warn = 4,
    /**
     * A log level that is used for error messages.
     */
    Error = 3,
    /**
     * A log level that is used for fatal messages.
     */
    Fatal = 2,
}

/**
 * Represents a message sink that can receive messages which is generally a function
 */
export interface MessageSink {
    (message: Message): void;
}

/**
 * Represents a message that can be sent to a message bus
 */
export interface Message extends Lookup {
    kind: string;
}

/**
 * A message bus that can send messages to listeners. This is primarily
 * used to send eventful messages to the ui.
 */
export interface MessageBus {
    /**
     * Adds a listener to the message bus.
     * @param listener The listener to add to the message bus.
     */
    addListener(listener: MessageSink): void;
    /**
     * Removes a listener from the message bus.
     * @param listener The listener to remove from the message bus.
     */
    removeListener(listener: MessageSink): void;
    /**
     * Sends a message to all listeners on the message bus.
     * @param message The message to send.
     */
    send(message: Message): void;
}

/**
 * A logging message bus that can send log messages to listeners.
 *
 * The logging message bus extends the message bus and adds additional
 * methods for writing log messages to the bus.
 */
export interface LoggingMessageBus extends MessageBus {
    /**
     * Determines if the log level is enabled.
     * @param level The log level.
     */
    enabled(level: LogLevel): boolean;

    /**
     * Sets the log level.
     * @param level The log level.
     */
    setLevel(level: LogLevel): this;

    /**
     * Writes a fatal log message to the message bus.
     * @param level The log level.
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

    /**
     * Writes an error log message to the message bus.
     * @param level The log level.
     * @param message The message to write.
     * @param args The message arguments.
     */
    error(error: Error, message?: string, ...args: unknown[]): this;

    /**
     * Writes a warning log message to the message bus.
     * @param message The message to write.
     * @param args The message arguments.
     */
    error(message?: string, ...args: unknown[]): this;

    /**
     * Writes a warning log message to the message bus.
     * @param level The log level.
     * @param message The message to write.
     * @param args The message arguments.
     */
    warn(error: Error, message?: string, ...args: unknown[]): this;

    /**
     * Writes an log message to the message bus.
     * @param message The message to write.
     * @param args The message arguments.
     */
    warn(message: string, ...args: unknown[]): this;

    /**
     * Writes an information log message to the message bus.
     * @param level The log level.
     * @param message The message to write.
     * @param args The message arguments.
     */
    info(error: Error, message?: string, ...args: unknown[]): this;

    /**
     * Writes an informational log message to the message bus.
     * @param message The message to write.
     * @param args The message arguments.
     */
    info(message: string, ...args: unknown[]): this;

    /**
     * Writes a debug log message to the message bus.
     * @param level The log level.
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

    /**
     * Writes a trace log message to the message bus.
     * @param level The log level.
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
}
