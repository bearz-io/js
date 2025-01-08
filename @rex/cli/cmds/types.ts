import { LogLevel } from "@rex/primitives";
import { EnumType } from "@cliffy/command";

/**
 * The log levels enum type for the CLI.
 */
export const logLevels = new EnumType(["trace", "debug", "info", "warn", "error", "fatal"]);

/**
 * Parse the log level value as string and return the log level enum.
 * @param value The log level value.
 * @returns The log level.
 */
export function parseLogLevel(value: string): LogLevel {
    switch (value) {
        case "trace":
        case "Trace":
            return LogLevel.Trace;
        case "debug":
        case "Debug":
            return LogLevel.Debug;
        case "info":
        case "Info":
            return LogLevel.Info;
        case "warn":
        case "Warn":
            return LogLevel.Warn;
        case "error":
        case "Error":
            return LogLevel.Error;
        case "fatal":
        case "Fatal":
            return LogLevel.Fatal;
        default:
            return LogLevel.Info;
    }
}
