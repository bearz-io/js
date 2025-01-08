import { AnsiLogLevel, AnsiMode, gray, magenta, red, reset, rgb24 } from "@bearz/ansi";
import { DefaultPipelineWriter } from "@bearz/ci-env";
import { CI_DRIVER } from "@bearz/ci-env/driver";
import { sprintf } from "@bearz/fmt/printf";
import { LogLevel, type RexWriter } from "@rex/primitives";

function handleStack(stack?: string) {
    stack = stack ?? "";
    const index = stack.indexOf("\n");
    if (index === -1) {
        return stack;
    }

    return stack.substring(index + 1);
}

/**
 * Handle the arguments for the methods that apply args to write to the output.
 * @param args The arguments to handle.
 * @returns The message and stack trace.
 */
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

/**
 * The group symbol for the output.
 */
export const groupSymbol =
    "\x1b[38;2;60;0;255m❯\x1b[39m\x1b[38;2;90;0;255m❯\x1b[39m\x1b[38;2;121;0;255m❯\x1b[39m\x1b[38;2;151;0;255m❯\x1b[39m\x1b[38;2;182;0;255m❯\x1b[39m";

/**
 * The job symbol for the output.
 */
export const jobSymbol =
    "\x1b[38;2;255;0;0m❯\x1b[39m\x1b[38;2;208;0;35m❯\x1b[39m\x1b[38;2;160;0;70m❯\x1b[39m\x1b[38;2;113;0;105m❯\x1b[39m\x1b[38;2;65;0;140m❯\x1b[39m";

/**
 * The deploy symbol for the output.
 */
export const deploySymbol =
    "\x1b[38;2;60;0;255m❯\x1b[39m\x1b[38;2;54;51;204m❯\x1b[39m\x1b[38;2;48;102;153m❯\x1b[39m\x1b[38;2;42;153;102m❯\x1b[39m\x1b[38;2;36;204;51m❯\x1b[39m";

/**
 * The pipeline writer for rex.
 */
export class PipelineWriter extends DefaultPipelineWriter implements RexWriter {
    /**
     * Sets the log level for the writer.
     * @param level The log level.
     * @returns The writer instance.
     */
    setLogLevel(level: LogLevel): this {
        switch (level) {
            case LogLevel.Debug:
                this.level = AnsiLogLevel.Debug;
                return this;
            case LogLevel.Error:
                this.level = AnsiLogLevel.Error;
                return this;
            case LogLevel.Fatal:
                this.level = AnsiLogLevel.Critical;
                return this;
            case LogLevel.Info:
                this.level = AnsiLogLevel.Information;
                return this;
            case LogLevel.Warn:
                this.level = AnsiLogLevel.Warning;
                return this;
            case LogLevel.Trace:
                this.level = AnsiLogLevel.Trace;
                return this;
        }

        return this;
    }

    /**
     * Determines if the log level is enabled.
     * @param level The log level.
     * @returns `true` if the log level is enabled, otherwise `false`.
     */
    override enabled(level: AnsiLogLevel | LogLevel): boolean {
        return this.level >= level;
    }

    /**
     * Skips a group.
     * @param name The group name.
     * @returns A reference to the writer for chaining.
     */
    skipGroup(name: string): this {
        switch (CI_DRIVER) {
            case "azdo":
                this.writeLine(`##[group]${name} (Skipped)`);
                this.endGroup();
                return this;

            case "github":
                this.writeLine(`::group::${name} (Skipped)`);
                this.endGroup();
                return this;

            default:
                if (this.settings.stdout === true) {
                    if (this.settings.mode === AnsiMode.TwentyFourBit) {
                        this.write(groupSymbol).write(reset(" "));
                        this.write(`${rgb24(name, 0xb400ff)} (Skipped)`).writeLine();
                        this.endGroup();
                        return this;
                    }

                    this.writeLine(magenta(`❯❯❯❯❯ ${name} `) + gray("(Skipped)"));
                    this.endGroup();
                    return this;
                }

                this.writeLine(`❯❯❯❯❯ ${name} (Skipped)`);
                this.endGroup();

                return this;
        }
    }

    /**
     * Ends the current group.
     * @returns The writer instance.
     */
    override endGroup(): this {
        switch (CI_DRIVER) {
            case "azdo":
                this.writeLine("##[endgroup]");
                return this;
            case "github":
                this.writeLine("::endgroup::");
                return this;
            default:
                return this;
        }
    }

    /**
     * Writes a fatal message to the output.
     * @param e The error.
     * @param message The message.
     * @param args The arguments.
     */
    fatal(e: Error, message?: string | undefined, ...args: unknown[]): this;
    /**
     * Write an fatal message to the output.
     * @param message The error message.
     * @param args The arguments to format the message.
     * @returns The writer instance.
     */
    fatal(message: string, ...args: unknown[]): this;
    fatal(): this {
        if (this.level < AnsiLogLevel.Critical) {
            return this;
        }

        const { msg, stack } = handleArguments(arguments);
        switch (CI_DRIVER) {
            case "azdo":
                this.writeLine(`##[error] [FATAL] ${msg}`);
                if (stack) {
                    this.writeLine(red(stack));
                }

                return this;

            case "github":
                this.writeLine(`::error:: [FATAL] ${msg}`);
                if (stack) {
                    this.writeLine(red(stack));
                }
                return this;

            default:
                {
                    if (this.settings.stdout) {
                        this.write(red("❯ [FATAL]: "));
                        this.writeLine(msg);
                        if (stack) {
                            this.writeLine(red(stack));
                        }
                        return this;
                    }

                    this.writeLine(`❯ [FATAL]: ${msg}`);
                    if (stack) {
                        this.writeLine(stack);
                    }
                }

                return this;
        }
    }
}

/**
 * The global pipeline writer for rex.
 */
export const writer: PipelineWriter = new PipelineWriter();
