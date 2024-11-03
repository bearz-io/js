import { env } from "@bearz/env";
import { AnsiSettings } from "../src/settings.ts";
import { blue, cyan, gray, green, magenta, red, yellow } from "./styles.ts";
import { sprintf } from "@bearz/fmt/printf";
import { AnsiLogLevel } from "../src/enums.ts";
import { isStdoutTerminal } from "../src/settings.ts";

// deno-lint-ignore no-explicit-any
const g = globalThis as any;
let args: string[] = [];
let write = (message?: string) => {
    console.log(message);
};
if (typeof g.Deno !== "undefined") {
    args = Deno.args;
    write = (message?: string) => {
        Deno.stdout.writeSync(new TextEncoder().encode(message));
    };
} else if (typeof g.process !== "undefined") {
    args = g.process.argv.slice(2);
    write = (message?: string) => {
        g.process.stdout.write(message);
    };
}

function handleStack(stack?: string) {
    stack = stack ?? "";
    const index = stack.indexOf("\n");
    if (index === -1) {
        return stack;
    }

    return stack.substring(index + 1);
}

export function handleArguments(
    args: IArguments,
): { msg: string | undefined; stack: string | undefined } {
    let msg: string | undefined = undefined;
    let stack: string | undefined = undefined;

    switch (args.length) {
        case 0:
            return { msg, stack };
        case 1: {
            if (args[0] instanceof Error) {
                const e = args[0] as Error;
                msg = e.message;
                stack = handleStack(e.stack);
            } else {
                msg = args[0] as string;
            }

            return { msg, stack };
        }

        case 2: {
            if (args[0] instanceof Error) {
                const e = args[0] as Error;
                const message = args[1] as string;
                msg = message;
                stack = handleStack(e.stack);
            } else {
                const message = args[0] as string;
                const splat = Array.from(args).slice(1);
                msg = sprintf(message, ...splat);
            }
            return { msg, stack };
        }

        default: {
            if (args[0] instanceof Error) {
                const e = args[0] as Error;
                const message = args[1] as string;
                const splat = Array.from(args).slice(2);
                msg = sprintf(message, ...splat);
                stack = handleStack(e.stack);
            } else {
                const message = args[0] as string;
                const splat = Array.from(args).slice(1);
                msg = sprintf(message, ...splat);
            }

            return { msg, stack };
        }
    }
}

export interface AnsiWriter {
    /**
     * Determines if the writer is interactive.
     */
    readonly interactive: boolean;

    /**
     * Gets the ANSI settings.
     */
    readonly settings: AnsiSettings;

    /**
     * Gets or sets the log level.
     */
    level: AnsiLogLevel;

    /**
     * Determines if the log level is enabled.
     * @param level The log level.
     */
    enabled(level: AnsiLogLevel): boolean;

    /**
     * Starts a new group that groups a set of messages.
     * @param name The group name.
     * @returns The writer.
     */
    startGroup(name: string): this;

    /**
     * Ends the current group.
     * @returns The writer.
     */
    endGroup(): this;

    /**
     * Writes a success message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    success(message: string, ...args: unknown[]): this;

    /**
     * Writes the progress of an operation to the output.
     * @param name The name of the progress.
     * @param value The value of the progress.
     * @returns The writer.
     */
    progress(name: string, value: number): this;

    /**
     * Writes a command to the output.
     * @param message The executable.
     * @param args The arguments passed to the command.
     * @returns The writer.
     */
    command(command: string, args: string[]): this;

    /**
     * Writes a debug message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    debug(message: string, ...args: unknown[]): this;

    /**
     * Writes a trace message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    trace(message: string, ...args: unknown[]): this;

    /**
     * Writes an information message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    info(message: string, ...args: unknown[]): this;

    /**
     * Writes an error message to the output.
     * @param e The error.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    error(e: Error, message?: string, ...args: unknown[]): this;
    /**
     * Writes an error message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    error(message: string, ...args: unknown[]): this;

    /**
     * Writes an warning message to the output.
     * @param e The error.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    warn(e: Error, message?: string, ...args: unknown[]): this;
    /**
     * Writes an warning message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    warn(message: string, ...args: unknown[]): this;

    /**
     * Writes a styled message to the output.
     * @param message The message to style.
     * @param styles The styles to apply.
     * @example
     * ```typescript
     * import { writer, bold, green, bgBlue } from "@bearz/ansi";
     *
     * writer.style("Hello, World!", bold, green, bgBlue);
     * ```
     */
    style(message: string, ...styles: ((str: string) => string)[]): void;

    /**
     * Writes a styled message as a new line to the output.
     * @param message The message to style.
     * @param styles The styles to apply.
     * @example
     * ```typescript
     * import { writer, bold, green, bgBlue } from "@bearz/ansi";
     *
     * writer.style("Hello, World!", bold, green, bgBlue);
     * ```
     */
    styleLine(message: string, ...styles: ((str: string) => string)[]): void;

    /**
     * Writes a message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    write(message?: string, ...args: unknown[]): this;

    /**
     * Writes a message as new line to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    writeLine(message?: string, ...args: unknown[]): this;
}

/**
 * The default implementation of the ANSI writer.
 */
export class DefaultAnsiWriter implements AnsiWriter {
    #interactive?: boolean;
    #level: AnsiLogLevel;

    /**
     * Creates a new instance of DefaultAnsiWriter.
     * @param level The log level.
     * @param secretMasker The secret masker.
     */
    constructor(level?: AnsiLogLevel) {
        this.#level = level ?? AnsiLogLevel.Debug;
    }

    /**
     * Gets or sets the log level.
     */
    get level(): AnsiLogLevel {
        return this.#level;
    }

    set level(value: AnsiLogLevel) {
        this.#level = value;
    }

    /**
     * Determines if the log level is enabled.
     * @param level The log level.
     * @returns `true` if the log level is enabled, `false` otherwise.
     */
    enabled(level: AnsiLogLevel): boolean {
        return this.#level >= level;
    }

    /**
     * Determines if the current environment is interactive.
     */
    get interactive(): boolean {
        if (this.#interactive !== undefined) {
            return this.#interactive;
        }

        if (env.get("CI") === "true") {
            this.#interactive = false;
            return false;
        }

        const isCi = [
            "CI",
            "GITHUB_ACTIONS",
            "GITLAB_CI",
            "CIRCLECI",
            "BITBUCKET_BUILD_NUMBER",
            "TF_BUILD",
            "JENKINS_URL",
        ].some((o) => env.has(o));

        if (isCi) {
            this.#interactive = false;
            return false;
        }

        if (env.get("DEBIAN_FRONTEND") === "noninteractive") {
            this.#interactive = false;
        }

        if (args.includes("-NonInteractive") || args.includes("--non-interactive")) {
            this.#interactive = false;
        }

        this.#interactive = isStdoutTerminal();
        return this.#interactive;
    }

    /**
     * Gets the ANSI settings.
     */
    get settings(): AnsiSettings {
        return AnsiSettings.current;
    }

    progress(name: string, value: number): this {
        this.write(`${name}: ${green(value.toString().padStart(2))}% \r`);
        return this;
    }

    /**
     * Writes a command to the output.
     * @param message The executable.
     * @param args The arguments passed to the command.
     * @returns The writer.
     */
    command(message: string, args: string[]): this {
        if (this.#level < AnsiLogLevel.Warning) {
            return this;
        }
        let splat = "";
        if (args.length > 0) {
            splat = args.join(" ");
        }

        const fmt = `$ ${message} ${splat}`;
        if (this.settings.mode > 0) {
            this.writeLine(cyan(fmt));
            return this;
        }

        this.writeLine(fmt);
        return this;
    }

    /**
     * Writes a trace message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns the writer.
     */
    trace(message: string, ...args: unknown[]): this {
        if (this.#level > AnsiLogLevel.Debug) {
            return this;
        }

        const fmt = `[TRC]: ${args.length > 0 ? sprintf(message, ...args) : message}`;

        if (this.settings.mode > 0) {
            this.writeLine(gray(fmt));
            return this;
        }

        this.writeLine(fmt);
        return this;
    }

    /**
     * Writes a debug message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns the writer.
     */
    debug(message: string, ...args: unknown[]): this {
        if (this.#level < AnsiLogLevel.Debug) {
            return this;
        }

        const fmt = `[DBG]: ${args.length > 0 ? sprintf(message, ...args) : message}`;

        if (this.settings.stdout) {
            this.writeLine(gray(fmt));
            return this;
        }

        this.writeLine(fmt);
        return this;
    }

    /**
     * Writes an warning message to the output.
     * @param e The error.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns the writer.
     */
    warn(e: Error, message?: string, ...args: unknown[]): this;
    /**
     * Writes a warning message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns the writer.
     */
    warn(message: string, ...args: unknown[]): this;
    warn(): this {
        if (this.#level < AnsiLogLevel.Warning) {
            return this;
        }

        const { msg, stack } = handleArguments(arguments);
        const fmt = `[WRN]: ${msg}`;

        if (this.settings.stdout) {
            this.writeLine(yellow(fmt));
            if (stack) {
                this.writeLine(yellow(stack));
            }
            return this;
        }

        this.writeLine(fmt);
        if (stack) {
            this.writeLine(stack);
        }

        return this;
    }

    /**
     * Writes an error message to the output.
     * @param e The error.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns the writer.
     */
    error(e: Error, message?: string, ...args: unknown[]): this;
    /**
     * Writes an error message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns the writer.
     */
    error(message: string, ...args: unknown[]): this;
    error(): this {
        if (this.#level < AnsiLogLevel.Error) {
            return this;
        }

        const { msg, stack } = handleArguments(arguments);
        const fmt = `[ERR]: ${msg}`;

        if (this.settings.stdout) {
            this.writeLine(red(fmt));
            if (stack) {
                this.writeLine(red(stack));
            }
            return this;
        }

        this.writeLine(fmt);
        if (stack) {
            this.writeLine(stack);
        }

        return this;
    }

    /**
     * Writes a success message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns The writer.
     */
    success(message: string, ...args: unknown[]): this {
        switch (arguments.length) {
            case 0:
                return this;

            case 1:
                {
                    if (this.settings.stdout) {
                        this.writeLine(green(`${message}`));
                    } else {
                        this.writeLine(`${message}`);
                    }
                }
                return this;

            default: {
                if (this.settings.stdout) {
                    this.writeLine(green(`${sprintf(message, ...args)}`));
                } else {
                    this.writeLine(`${sprintf(message, ...args)}`);
                }

                return this;
            }
        }
    }

    /**
     * Writes an informational message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns the writer.
     */
    info(message: string, ...args: unknown[]): this {
        if (this.#level < AnsiLogLevel.Information) {
            return this;
        }
        const fmt = `[INF]: ${args.length > 0 ? sprintf(message, ...args) : message}`;

        if (this.settings.stdout) {
            this.writeLine(blue(fmt));
            return this;
        }

        this.writeLine(fmt);
        return this;
    }

    /**
     * Writes a styled message to the output.
     *
     * @param message The message to style.
     * @param styles The styles to apply.
     * @example
     * ```typescript
     * import { writer, bold, green, bgBlue } from "@bearz/ansi";
     *
     * writer.style("Hello, World!", bold, green, bgBlue);
     * ```
     */
    style(message: string, ...styles: ((str: string) => string)[]): void {
        this.write(styles.reduce((acc, style) => style(acc), message));
    }

    /**
     * Writes a styled message as a new line to the output.
     * @param message The message to style.
     * @param styles The styles to apply.
     */
    styleLine(message: string, ...styles: ((str: string) => string)[]): void {
        this.writeLine(styles.reduce((acc, style) => style(acc), message));
    }

    /**
     * Writes a message to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns the writer.
     */
    write(message?: string, ...args: unknown[]): this {
        if (message === undefined) {
            return this;
        }

        switch (arguments.length) {
            case 0:
                return this;

            case 1:
                write(message);
                break;

            default:
                {
                    const formatted = sprintf(message, ...args);
                    write(formatted);
                }

                break;
        }

        return this;
    }

    /**
     * Writes a message as a new line to the output.
     * @param message The message to write.
     * @param args The message arguments.
     * @returns the writer.
     */
    writeLine(message?: string, ...args: unknown[]): this {
        switch (arguments.length) {
            case 0:
                write("\n");
                break;

            case 1:
                write(`${message}\n`);
                break;

            default:
                {
                    const formatted = sprintf(`${message}\n`, ...args);
                    write(formatted);
                }

                break;
        }

        return this;
    }

    /**
     * Starts a new group that groups a set of messages.
     * @param name The group name.
     * @returns the writer.
     */
    startGroup(name: string): this {
        if (this.settings.stdout) {
            this.writeLine(magenta(`> ${name}`));
        } else {
            this.writeLine(`> ${name}`);
        }

        return this;
    }

    /**
     * Ends the current group.
     * @returns the writer.
     */
    endGroup(): this {
        this.writeLine();
        return this;
    }
}

export const writer: AnsiWriter = new DefaultAnsiWriter();
