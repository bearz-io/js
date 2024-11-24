import type { AnsiLogLevel, AnsiWriter } from "@bearz/ansi";
import type { SecretMasker } from "@bearz/secrets";
import type { LogLevel } from "./log_level.ts";

export interface RexWriter extends AnsiWriter {
    readonly secretMasker: SecretMasker;

    mask(value: string): this;

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
