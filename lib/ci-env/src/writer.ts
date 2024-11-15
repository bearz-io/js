import { AnsiLogLevel, red } from "@bearz/ansi";
import { DefaultAnsiWriter } from "@bearz/ansi/writer";
import { CI_DRIVER } from "./driver.ts";
import { sprintf } from "@bearz/fmt/printf";

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

export class PipelineWriter extends DefaultAnsiWriter {
    /**
     * Write a command to the output.
     * @param command The name of the command.
     * @param args The arguments passed to the command.
     * @returns The writer instance.
     */
    override command(command: string, args?: string[]): this {
        args = args ?? [];
        switch (CI_DRIVER) {
            case "azdo":
                this.writeLine(`##vso[command]${command} ${args.join(" ")}`);
                return this;
            default: {
                return super.command(command, args);
            }
        }
    }

    /**
     * Writes the progress of an operation to the output.
     * @param name The name of the progress indicator.
     * @param value The value of the progress indicator.
     * @returns The writer instance.
     */
    override progress(name: string, value: number): this {
        switch (CI_DRIVER) {
            case "azdo":
                this.writeLine(`##vso[task.setprogress value=${value};]${name}`);
                return this;
            default:
                return super.progress(name, value);
        }
    }

    /**
     * Start a new group of log messages.
     * @param name The name of the group.
     * @returns The writer instance.
     */
    override startGroup(name: string): this {
        switch (CI_DRIVER) {
            case "azdo":
                this.writeLine(`##[group]${name}`);
                return this;
            case "github":
                this.writeLine(`::group::${name}`);
                return this;
            default:
                return super.startGroup(name);
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
                return super.endGroup();
        }
    }

    /**
     * Write a debug message to the output.
     * @param e The error to write.
     * @param message The message to write.
     * @param args The arguments to format the message.
     * @returns The writer instance.
     */
    override debug(e: Error, message?: string | undefined, ...args: unknown[]): this;
    /**
     * Write a debug message to the output.
     * @param message The debug message.
     * @param args The arguments to format the message.
     * @returns The writer instance.
     */
    override debug(message: string, ...args: unknown[]): this;
    override debug(): this {
        if (this.level < AnsiLogLevel.Debug) {
            return this;
        }

        const { msg, stack } = handleArguments(arguments);
        switch (CI_DRIVER) {
            case "azdo":
                this.writeLine(`##[debug]${msg}`);
                if (stack) {
                    this.writeLine(stack);
                }
                return this;
            case "github":
                this.writeLine(`::debug::${msg}`);
                if (stack) {
                    this.writeLine(stack);
                }
                return this;
            default: {
                const args = Array.from(arguments);
                const first = args.shift();
                if (args[0] instanceof Error) {
                    const e = first;
                    if (args.length === 0) {
                        return super.error(e);
                    }

                    const m = args.shift() as string;
                    return super.error(e, m, ...args);
                }

                return super.error(first as string, ...args);
            }
        }
    }

    /**
     * Write an error message to the output.
     * @param e The error to write.
     * @param message The message to write.
     * @param args The arguments to format the message.
     */
    override error(e: Error, message?: string | undefined, ...args: unknown[]): this;
    /**
     * Write an error message to the output.
     * @param message The error message.
     * @param args The arguments to format the message.
     * @returns The writer instance.
     */
    override error(message: string, ...args: unknown[]): this;
    override error(): this {
        if (this.level < AnsiLogLevel.Error) {
            return this;
        }

        const { msg, stack } = handleArguments(arguments);
        switch (CI_DRIVER) {
            case "azdo":
                this.writeLine(`##[error]${msg}`);
                if (stack) {
                    this.writeLine(red(stack));
                }

                return this;

            case "github":
                this.writeLine(`::error::${msg}`);
                if (stack) {
                    this.writeLine(red(stack));
                }
                return this;

            default: {
                const args = Array.from(arguments);
                const first = args.shift();
                if (args[0] instanceof Error) {
                    const e = first;
                    if (args.length === 0) {
                        return super.error(e);
                    }

                    const m = args.shift() as string;
                    return super.error(e, m, ...args);
                }

                return super.error(first as string, ...args);
            }
        }
    }

    /**
     * Write a warning message to the output.
     * @param e The error to write.
     * @param message The message to write.
     * @param args The arguments to format the message.
     */
    override warn(e: Error, message?: string | undefined, ...args: unknown[]): this;
    /**
     * Write a warning message to the output.
     * @param message The warning message.
     * @param args The arguments to format the message.
     * @returns The writer instance.
     */
    override warn(message: string, ...args: unknown[]): this;
    override warn(): this {
        if (this.level < AnsiLogLevel.Warning) {
            return this;
        }

        const { msg, stack } = handleArguments(arguments);
        switch (CI_DRIVER) {
            case "azdo":
                this.writeLine(`##[warning]${msg}`);
                if (stack) {
                    this.writeLine(stack);
                }
                return this;
            case "github":
                this.writeLine(`::warning::${msg}`);
                if (stack) {
                    this.writeLine(stack);
                }
                return this;
            default: {
                const args = Array.from(arguments);
                const first = args.shift();
                if (args[0] instanceof Error) {
                    const e = first;
                    if (args.length === 0) {
                        return super.warn(e);
                    }

                    const m = args.shift() as string;
                    return super.warn(e, m, ...args);
                }

                return super.warn(first as string, ...args);
            }
        }
    }
}

/**
 * The global writer instance.
 */
export const writer: PipelineWriter = new PipelineWriter();
