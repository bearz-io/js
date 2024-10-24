import { print, printLn, sprintf } from "@bearz/fmt/printf";

let debugEnabled = false;

// deno-lint-ignore no-explicit-any
const g = globalThis as any;
if (g.Deno && !g.BEARZ_USE_NODE) {
    debugEnabled = Deno.env.get("DEBUG") === "true" || Deno.env.get("DEBUG") === "1";
} else if (g.process) {
    // deno-lint-ignore no-explicit-any
    const process = g.process as any;
    debugEnabled = process.env.DEBUG === "true" || process.env.DEBUG === "1";
}

if (g.BEARZ_DEBUG !== undefined) {
    debugEnabled = g.BEARZ_DEBUG === "true" || g.BEARZ_DEBUG === "1";
}

/**
 * Sets the debug enabled flag.
 *
 * @param enabled The value to set the debug enabled flag to.
 */
export function setDebugEnabled(enabled: boolean): void {
    debugEnabled = enabled;
}

/**
 * Gets the value of the debug enabled flag.
 * @returns The value of the debug enabled flag.
 */
export function isDebugEnabled(): boolean {
    return debugEnabled;
}

/**
 * A stream to write debug messages to.
 */
export interface DebugStreamWriter {
    /**
     * Writes a message to the stream.
     * @param message The message to write.
     */
    write(message: string): void;
    /**
     * Writes a line to the stream as new line.
     * @param message The message to write.
     */
    writeLine(message: string): void;
}

let debugStream: DebugStreamWriter = {
    write(message: string): void {
        print(message);
    },

    writeLine(message: string): void {
        printLn(message);
    },
};
/**
 * Sets the stream to write debug messages to.
 * @param stream The stream to write debug messages to.
 */
export function setDebugStream(stream: DebugStreamWriter): void {
    debugStream = stream;
}

/**
 * Asserts that a condition is true. If the condition is false, then
 * the stack trace is written to the debug stream.
 *
 * @param condition The condition to check.
 * @param mesage The message to write.
 * @param args The arguments to format the message with.
 */
export function assert(condition: unknown, mesage: string, ...args: unknown[]): void;
/**
 * Asserts that a condition is true. If the condition is false, then
 * the stack trace is written to the debug stream.
 * @param condition The condition to check.
 * @param message The message to write.
 */
export function assert(condition: unknown, message: string): void;
/**
 * Asserts that a condition is true. If the condition is false, then
 * the stack trace is written to the debug stream.
 * @param condition The condition to check.
 */
export function assert(condition: unknown): void;
export function assert(): void {
    if (!debugEnabled) {
        return;
    }

    switch (arguments.length) {
        case 0:
            {
                const error = new Error("Assertion failed");
                if (error.stack) {
                    debugStream.writeLine(error.stack);
                } else {
                    debugStream.writeLine("Assertion failed");
                }
            }

            break;
        case 1:
            {
                if (!arguments[0]) {
                    const error = new Error("Assertion failed");
                    if (error.stack) {
                        debugStream.writeLine(error.stack);
                    } else {
                        debugStream.writeLine("Assertion failed");
                    }
                }
            }

            break;
        case 2:
            {
                if (!arguments[0]) {
                    const error = new Error(arguments[1]);
                    if (error.stack) {
                        debugStream.writeLine(error.stack);
                    } else {
                        debugStream.writeLine(arguments[1]);
                    }
                }
            }

            break;

        case 3:
            {
                if (!arguments[0]) {
                    const error = new Error(sprintf(arguments[1], ...Array.from(arguments).slice(2)));
                    if (error.stack) {
                        debugStream.writeLine(error.stack);
                    }
                }
            }
            break;

        default:
            break;
    }
}

/**
 * Writes a message to the debug stream.
 * @param message The message to write.
 * @param args The arguments to format the message with.
 */
export function write(message: string, ...args: unknown[]): void;
export function write(): void {
    if (!debugEnabled) {
        return;
    }

    if (arguments.length === 0) {
        return;
    }

    if (arguments.length === 1) {
        debugStream.write(arguments[0]);
        return;
    }

    debugStream.write(sprintf(arguments[0], ...Array.from(arguments).slice(1)));
}

export function writeLine(message: string, ...args: unknown[]): void;
/**
 * Writes a line to the debug stream, if debug is enabled.
 * @param message The formatted message to write.
 * @param args The arguments to format the message with.
 * @returns void
 * @example
 * ```ts
 * import { writeLine, isDebugEnabled } from "@gnome/debug";
 *
 * if (isDebugEnabled())
 *      writeLine("Hello, %s!", "world");
 * ```
 */
export function writeLine(message: string, ...args: unknown[]): void;
/**
 * Writes a line to the debug stream, if debug is enabled.
 * @param message The message to write.
 */
export function writeLine(message: string): void;
/**
 * Writes a line to the debug stream, if debug is enabled.
 * @returns void
 */
export function writeLine(): void;
export function writeLine(): void {
    if (!debugEnabled) {
        return;
    }

    if (arguments.length === 0) {
        debugStream.writeLine("");
        return;
    }

    if (arguments.length === 1) {
        debugStream.writeLine(arguments[0]);
        return;
    }

    debugStream.writeLine(sprintf(arguments[0], ...Array.from(arguments).slice(1)));
}

/**
 * Writes a message to the debug stream if the condition is true.
 * @param condition The condition to check.
 * @param message The formatted message to write.
 * @param args The arguments to format the message with.
 */
export function writeLineIf(condition: boolean, message: string, ...args: unknown[]): void;
/**
 * Writes a message to the debug stream if the condition is true.
 * @param condition The condition to check.
 * @param message The message to write.
 */
export function writeLineIf(condition: boolean, message: string): void;
export function writeLineIf(): void {
    if (!debugEnabled) {
        return;
    }

    if (arguments.length === 0) {
        return;
    }

    if (arguments.length === 1) {
        if (arguments[0]) {
            debugStream.writeLine("");
        }

        return;
    }

    if (arguments[0]) {
        debugStream.writeLine(sprintf(arguments[1], ...Array.from(arguments).slice(2)));
    }
}
