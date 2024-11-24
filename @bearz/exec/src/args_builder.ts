import { isSpace } from "@bearz/chars/is-space";

export interface ArgsBuilderOptions {
    prefix?: string;
    shortPrefix?: string;
    assign?: string;
    flags?: string[];
    appendArgs?: boolean;
}

function includesSpace(str: string) {
    for (let i = 0; i < str.length; i++) {
        if (isSpace(str.codePointAt(i) ?? 0)) {
            return true;
        }
    }

    return false;
}

/** */
export class ArgsBuilder {
    #command: string[];
    #arguments: string[];
    #options: Record<string, unknown>;
    #flags: string[];
    #argOptions: ArgsBuilderOptions;
    #postArguments: string[];

    constructor(options?: ArgsBuilderOptions) {
        this.#command = [];
        this.#arguments = [];
        this.#options = {};
        this.#flags = [];
        this.#postArguments = [];
        this.#argOptions = options || {
            prefix: "--",
            shortPrefix: "-",
        };
    }

    /**
     * The arguments to add.
     *
     * @param arg The arguments to add.
     * @returns The builder.
     */
    args(...arg: string[]): this {
        this.#arguments.push(...arg);
        return this;
    }

    /**
     * Adds subcommands to the command.
     * @param command The command to add.
     * @returns The builder.
     */
    subcommand(...command: string[]): this {
        this.#command.push(...command);
        return this;
    }

    /**
     * Adds a flag to the command.
     * @param flags The flags to add.
     * @returns The builder.
     */
    flag(...flags: string[]): this {
        this.#flags.push(...flags);
        return this;
    }

    /**
     * Adds an option to the command.
     * @param name The name of the option.
     * @param value The value of the option.
     * @param singleQuote Whether to wrap the value in single quotes.
     * @returns The builder.
     */
    option(name: string, value: unknown, singleQuote = false): this {
        if (singleQuote) {
            this.#options[name] = `'${value}'`;
        } else {
            this.#options[name] = value;
        }

        return this;
    }

    /**
     * Appends arguments that should be placed after the command
     * using the `--` separator.
     * @param arg The arguments to append.
     * @returns The builder.
     */
    postArgs(...args: string[]): this {
        this.#postArguments.push(...args);
        return this;
    }

    /**
     * Builds the arguments.
     * @returns The built arguments.
     */
    build(): string[] {
        const args: string[] = [];
        if (this.#command.length > 0) {
            args.push(...this.#command);
        }

        if (!this.#argOptions.appendArgs) {
            args.push(...this.#arguments);
        }

        for (const flag of this.#flags) {
            if (this.#argOptions.shortPrefix && flag.length === 1) {
                args.push(this.#argOptions.shortPrefix + flag);
            } else {
                args.push(this.#argOptions.prefix + flag);
            }
        }

        for (const [key, value] of Object.entries(this.#options)) {
            if (this.#argOptions.flags?.includes(key)) {
                if (!value) {
                    continue;
                }

                if (this.#argOptions.shortPrefix && key.length === 1) {
                    args.push(this.#argOptions.shortPrefix + key);
                } else {
                    args.push(this.#argOptions.prefix + key);
                }

                continue;
            }

            let v = value;

            if (this.#argOptions.assign) {
                if (typeof v === "string") {
                    if (!v.startsWith("'") && !v.startsWith('"') && includesSpace(v)) {
                        v = `"${v}"`;
                    }
                }
                if (this.#argOptions.shortPrefix && key.length === 1) {
                    args.push(this.#argOptions.shortPrefix + key + this.#argOptions.assign + value);
                } else {
                    args.push(this.#argOptions.prefix + key + this.#argOptions.assign + value);
                }

                continue;
            }

            if (this.#argOptions.shortPrefix && key.length === 1) {
                args.push(this.#argOptions.shortPrefix + key);
            } else {
                args.push(this.#argOptions.prefix + key);
            }

            args.push(String(v));
        }

        if (this.#argOptions.appendArgs) {
            args.push(...this.#arguments);
        }

        if (this.#postArguments.length > 0) {
            args.push("--");
            args.push(...this.#postArguments);
        }

        return args;
    }
}
