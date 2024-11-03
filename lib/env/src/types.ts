export interface SubstitutionOptions {
    /**
     * Enables or disables Windows-style variable expansion.
     * @default true
     */
    windowsExpansion?: boolean;
    /**
     * Enables or disables Unix-style variable expansion.
     * @default true
     */
    unixExpansion?: boolean;
    /**
     * Enables or disables Unix-style variable assignment.
     * @default true
     */
    unixAssignment?: boolean;
    /**
     * Enables or disables Unix-style custom error messages.
     * @default true
     */
    unixCustomErrorMessage?: boolean;
    /**
     * Enables or disables Unix-style argument expansion.
     * @default true
     */
    unixArgsExpansion?: boolean;
    /**
     * A function that retrieves the value of an environment variable.
     * Setting this option overrides the default behavior
     * @param key - The name of the environment variable.
     * @returns The value of the environment variable, or `undefined` if it is not set.
     */
    get?: (key: string) => string | undefined;
    /**
     * A function that sets the value of an environment variable.
     * Setting this option overrides the default behavior.
     * @param key - The name of the environment variable.
     * @param value - The value to set.
     */
    set?: (key: string, value: string) => void;
}

export interface EnvPath extends Iterable<string> {
    /**
     * Retrieves the current environment path.
     * @returns The current environment path.
     */
    get(): string;

    /**
     * Overwrites the environment path with the specified path.
     * @param path - The new environment path.
     */
    overwrite(path: string): void;

    /**
     * Splits the environment path into an array of individual paths.
     * @returns An array of individual paths.
     */
    split(): string[];

    /**
     * Checks if the environment path contains the specified path.
     * @param path - The path to check.
     * @returns `true` if the path is found, `false` otherwise.
     */
    has(path: string): boolean;

    /**
     * Appends the specified path to the environment path.
     * @param path - The path to append.
     */
    append(path: string): void;

    /**
     * Prepends the specified path to the environment path.
     * @param path - The path to prepend.
     */
    prepend(path: string): void;

    /**
     * Removes the specified path from the environment path.
     * @param path - The path to remove.
     */
    remove(path: string): void;

    /**
     * Replaces the specified old path with the new path in the environment path.
     * @param oldPath - The path to replace.
     * @param newPath - The new path.
     */
    replace(oldPath: string, newPath: string): void;

    [Symbol.iterator](): IterableIterator<string>;

    /**
     * Returns the string representation of the environment path.
     * @returns The string representation of the environment path.
     */
    toString(): string;
}

export interface Env extends Iterable<{ key: string; value: string }> {
    /**
     * Returns the environment variables as a record of key-value pairs.
     */
    get proxy(): Record<string, string | undefined>;

    /**
     * Returns the `EnvPath` instance associated with this `Env` object.
     */
    get path(): EnvPath;

    /**
     * Returns the value associated with the specified name from the environment variables.
     * If the value is undefined, returns the provided default value.
     *
     * @param name - The name of the environment variable.
     * @param defaultValue - The default value to return if the environment variable is undefined. Default is an empty string.
     * @returns The value of the environment variable or the default value if it is undefined.
     */
    defaultString(name: string, defaultValue?: string): string;

    /**
     * Returns the boolean value associated with the specified name, or the default value if the value is undefined.
     *
     * @param name - The name of the boolean value.
     * @param defaultValue - The default value to return if the value is undefined. Defaults to `false`.
     * @returns The boolean value associated with the specified name, or the default value if the value is undefined.
     */
    defaultBool(name: string, defaultValue?: boolean): boolean;

    /**
     * Returns the value of the specified number configuration option.
     * If the value is undefined, returns the provided default value.
     *
     * @param name - The name of the configuration option.
     * @param defaultValue - The default value to return if the configuration option is undefined. Default is 0.
     * @returns The value of the configuration option or the default value.
     */
    defaultNumber(name: string, defaultValue?: number): number;

    /**
     * Retrieves the integer value associated with the specified name from the environment.
     * If the value is not found, returns the default value.
     *
     * @param name - The name of the environment variable.
     * @param defaultValue - The default value to return if the environment variable is not found. Default is 0.
     * @param radix - An optional radix (base) for parsing the integer value. Default is 10.
     * @returns The integer value associated with the specified name, or the default value if not found.
     */
    defaultInt(name: string, defaultValue?: number, radix?: number): number;

    /**
     * Retrieves the value of the specified date property from the environment.
     * If the value is undefined, returns the provided defaultValue or a default date value.
     * @param name - The name of the date property.
     * @param defaultValue - The default value to return if the property value is undefined. Defaults to a date representing January 1, 1971.
     * @returns The value of the date property or the default value.
     */
    defaultDate(name: string, defaultValue?: Date): Date;

    /**
     * Retrieves the JSON value with the specified name from the environment and returns it.
     * If the JSON value is not found, the defaultValue is returned instead.
     *
     * @template T - The type of the JSON value.
     * @param {string} name - The name of the JSON value.
     * @param {T} [defaultValue] - The default value to return if the JSON value is not found.
     * Defaults to `unknown` and returns an object.
     * @returns {T} - The JSON value or the defaultValue if not found. Defaults to `unnkown`.
     */
    defaultJson<T = unknown>(name: string, defaultValue?: T): T;

    /**
     * Expands a template string by replacing placeholders with their corresponding values.
     *
     * @param template The template string to expand.
     * @param options The options for substitution.
     * @returns The expanded string.
     * @example
     * ```ts
     * import { env } from "@bearz/env";
     *
     * env.set("NAME", "Alice");
     * console.log(env.expand("Hello, ${NAME}! You are ${AGE:-30} years old.")); // Hello, Alice! You are 30 years old.
     * ```
     */
    expand(template: string, options?: SubstitutionOptions): string;

    /**
     * Retrieves the value of the specified environment variable.
     *
     * @param name - The name of the environment variable.
     * @returns The value of the environment variable, or `undefined` if it is not set.
     */
    get(name: string): string | undefined;

    getArray(name: string, separator?: string): string[] | undefined;

    getBinary(name: string): Uint8Array | undefined;

    /**
     * Retrieves a boolean value from the environment variable with the given name.
     *
     * @description
     * The following values are considered `true`:
     * - `1`
     * - `true` (case-insensitive)
     *
     * @param name - The name of the environment variable.
     * @returns The boolean value of the environment variable, or `undefined` if the variable is not set or has an invalid value.
     */
    getBool(name: string): boolean | undefined;

    /**
     * Retrieves the value associated with the specified name and converts it to a number.
     * Returns `undefined` if the value is not found or cannot be converted to a number.
     *
     * @param name - The name of the value to retrieve.
     * @returns The converted number value, or `undefined` if the value is not found or cannot be converted.
     * @example
     * ```ts
     * import { env } from "@bearz/env";
     *
     * ent.set("PORT", "8080");
     * console.log(env.getNumber("PORT")); // 8080
     * ```
     */
    getNumber(name: string): number | undefined;

    /**
     * Retrieves the integer value associated with the specified name from the environment.
     *
     * @param name - The name of the environment variable.
     * @param radix - An optional radix (base) for parsing the value. Defaults to 10 if not provided.
     * @returns The parsed integer value, or `undefined` if the value is not found or cannot be parsed as an integer.
     */
    getInt(name: string, radix?: number): number | undefined;

    /**
     * Retrieves the value associated with the specified name and converts it to a Date object.
     *
     * @param name - The name of the value to retrieve.
     * @returns The Date object representing the value, or undefined if the value is not found.
     */
    getDate(name: string): Date | undefined;

    /**
     * Retrieves a JSON value from the environment variables by name.
     *
     * @param name - The name of the environment variable.
     * @returns The parsed JSON value if it exists, otherwise undefined.
     * @template T - The type of the parsed JSON value. Defaults to `unknown`.
     */
    getJson<T = unknown>(name: string): T | undefined;

    /**
     * Retrieves the value of the specified environment variable.
     * If the environment variable is not set, throws an error.
     *
     * @param name - The name of the environment variable.
     * @returns The value of the environment variable.
     * @throws {Error} If the environment variable is not set.
     */
    require(name: string): string;

    /**
     * Merges the provided environment variables into the current environment.
     * @param env - The environment variables to merge.
     * @returns The updated instance of the `EnvBrowser` class.
     */
    merge(env: Record<string, string | undefined>): this;

    /**
     * Sets the value of the specified environment variable.
     *
     * @param name - The name of the environment variable.
     * @param value - The value to set.
     */
    set(name: string, value: string): this;

    /**
     * Checks if the specified environment variable is set.
     *
     * @param name - The name of the environment variable.
     * @returns `true` if the environment variable is set, `false` otherwise.
     */
    has(name: string): boolean;

    /**
     * Removes the specified environment variable.
     *
     * @param name - The name of the environment variable to remove.
     */
    remove(name: string): this;

    /**
     * Prints the environment variables to the console.
     */
    dump(): void;

    /**
     * Returns the environment variables as a record of key-value pairs.
     *
     * @returns The environment variables as a record of key-value pairs.
     */
    toObject(): Record<string, string | undefined>;

    /**
     * Joins an array of paths into a single path string.
     *
     * @param paths - An array of paths to be joined.
     * @returns The joined path string.
     */
    joinPath(paths: string[]): string;
}
