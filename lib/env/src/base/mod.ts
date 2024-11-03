import { equalFold } from "@bearz/strings/equal";
import { expand } from "../expand.ts";
import type { Env, EnvPath, SubstitutionOptions } from "../types.ts";
import { BUN, DENO, NODE, PATH_SEP, WINDOWS } from "@bearz/runtime-info";
import { decodeBase64 } from "@std/encoding";

const RT = DENO || BUN || NODE;
const SEP = RT ? PATH_SEP : ":";
const PATH_NAME = WINDOWS && RT ? "Path" : "PATH";

/**
 * Represents a class that manages the environment path.
 */
export class DefaultEnvPath implements EnvPath {
    #env: EnvBase;

    /**
     * Constructs a new instance of the DefaultEnvPath class.
     * @param env The environment object.
     */
    constructor(env: EnvBase) {
        this.#env = env;
    }

    /**
     * Retrieves the current environment path.
     * @returns The current environment path.
     */
    get(): string {
        return this.#env.get(PATH_NAME) ?? "";
    }

    /**
     * Overwrites the environment path with the specified path.
     * @param path - The new environment path.
     */
    overwrite(path: string): void {
        this.#env.set(PATH_NAME, path);
    }

    /**
     * Splits the environment path into an array of individual paths.
     * @returns An array of individual paths.
     */
    split(): string[] {
        return this.get().split(SEP);
    }

    /**
     * Checks if the environment path contains the specified path.
     * @param path - The path to check.
     * @returns `true` if the path is found, `false` otherwise.
     */
    has(path: string): boolean {
        return this.hasPath(this.split(), path);
    }

    indexOf(path: string): number {
        return this.indexOfPaths(this.split(), path);
    }

    /**
     * Appends the specified path to the environment path.
     * @param path - The path to append.
     */
    append(path: string): void {
        const paths = this.split();
        if (!this.hasPath(paths, path)) {
            paths.push(path);
            this.overwrite(paths.filter((o) => o.length > 0).join(SEP));
        }
    }

    /**
     * Prepends the specified path to the environment path.
     * @param path - The path to prepend.
     */
    prepend(path: string): void {
        const paths = this.split();
        if (!this.hasPath(paths, path)) {
            paths.unshift(path);
            this.overwrite(paths.filter((o) => o.length > 0).join(SEP));
        }
    }

    /**
     * Removes the specified path from the environment path.
     * @param path - The path to remove.
     */
    remove(path: string): void {
        const paths = this.split();
        const index = this.indexOfPaths(paths, path);
        if (index !== -1) {
            paths.splice(index, 1);
            this.overwrite(this.join(paths));
        }
    }

    /**
     * Replaces the specified old path with the new path in the environment path.
     * @param oldPath - The path to replace.
     * @param newPath - The new path.
     */
    replace(oldPath: string, newPath: string): void {
        const paths = this.split();
        const index = this.indexOfPaths(paths, oldPath);
        if (index !== -1) {
            paths[index] = newPath;
            this.overwrite(this.join(paths));
        }
    }

    /**
     * Returns an iterator for iterating over the individual paths in the environment path.
     * @returns An iterator for the individual paths.
     */
    *[Symbol.iterator](): IterableIterator<string> {
        for (const path of this.split()) {
            yield path;
        }
    }

    /**
     * Returns the string representation of the environment path.
     * @returns The string representation of the environment path.
     */
    toString(): string {
        return this.get();
    }

    private indexOfPaths(paths: string[], path: string): number {
        if (path === undefined) {
            return -1;
        }

        if (WINDOWS && RT) {
            for (let i = 0; i < paths.length; i++) {
                if (equalFold(paths[i], path)) {
                    return i;
                }
            }

            return -1;
        }

        return paths.indexOf(path);
    }

    private hasPath(paths: string[], path: string): boolean {
        if (WINDOWS && RT) {
            for (const p of paths) {
                if (p.localeCompare(path, undefined, { sensitivity: "accent" }) === 0) {
                    return true;
                }
            }

            return false;
        }

        return paths.includes(path);
    }

    private join(paths: string[]): string {
        return paths.join(SEP);
    }
}

/**
 * Represents the environment variables and provides methods to interact with them.
 */
export abstract class EnvBase implements Env {
    #path!: EnvPath;
    #proxy!: Record<string, string | undefined>;

    constructor() {
        this.init();
    }

    /**
     * Returns a proxy object that allows you to access, set, or delete
     * environment variables as properties.
     */
    get proxy(): Record<string, string | undefined> {
        return this.#proxy;
    }

    protected set proxy(obj: Record<string, string | undefined>) {
        this.#proxy = obj;
    }

    /**
     * Gets the path of the environment.
     * @returns The path of the environment.
     */
    get path(): EnvPath {
        return this.#path;
    }

    protected set path(path: EnvPath) {
        this.#path = path;
    }

    /**
     * Returns the value associated with the specified name from the environment variables.
     * If the value is undefined, returns the provided default value.
     *
     * @param name - The name of the environment variable.
     * @param defaultValue - The default value to return if the environment variable is undefined. Default is an empty string.
     * @returns The value of the environment variable or the default value if it is undefined.
     */
    defaultString(name: string, defaultValue = ""): string {
        const value = this.get(name);
        if (value === undefined) {
            return defaultValue;
        }

        return value;
    }

    /**
     * Returns the boolean value associated with the specified name, or the default value if the value is undefined.
     *
     * @param name - The name of the boolean value.
     * @param defaultValue - The default value to return if the value is undefined. Defaults to `false`.
     * @returns The boolean value associated with the specified name, or the default value if the value is undefined.
     */
    defaultBool(name: string, defaultValue = false): boolean {
        const value = this.getBool(name);
        if (value === undefined) {
            return defaultValue;
        }

        return value;
    }

    /**
     * Returns the value of the specified number configuration option.
     * If the value is undefined, returns the provided default value.
     *
     * @param name - The name of the configuration option.
     * @param defaultValue - The default value to return if the configuration option is undefined. Default is 0.
     * @returns The value of the configuration option or the default value.
     */
    defaultNumber(name: string, defaultValue = 0): number {
        const value = this.getNumber(name);
        if (value === undefined) {
            return defaultValue;
        }

        return value;
    }

    /**
     * Retrieves the integer value associated with the specified name from the environment.
     * If the value is not found, returns the default value.
     *
     * @param name - The name of the environment variable.
     * @param defaultValue - The default value to return if the environment variable is not found. Default is 0.
     * @param radix - An optional radix (base) for parsing the integer value. Default is 10.
     * @returns The integer value associated with the specified name, or the default value if not found.
     */
    defaultInt(name: string, defaultValue = 0, radix?: number): number {
        const value = this.getInt(name, radix);
        if (value === undefined) {
            return defaultValue;
        }

        return value;
    }

    /**
     * Retrieves the value of the specified date property from the environment.
     * If the value is undefined, returns the provided defaultValue or a default date value.
     * @param name - The name of the date property.
     * @param defaultValue - The default value to return if the property value is undefined. Defaults to a date representing January 1, 1971.
     * @returns The value of the date property or the default value.
     */
    defaultDate(name: string, defaultValue?: Date): Date {
        const value = this.getDate(name);
        if (value === undefined) {
            defaultValue ??= new Date(1971, 1, 1, 0, 0, 0, 0);
            return defaultValue;
        }

        return value;
    }

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
    defaultJson<T = unknown>(name: string, defaultValue?: T): T {
        const json = this.getJson<T>(name);
        if (json === undefined) {
            defaultValue ??= {} as T;
            return defaultValue;
        }

        return json;
    }

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
    expand(template: string, options?: SubstitutionOptions): string {
        return expand(
            template,
            (name: string) => this.get(name),
            (name: string, value: string) => this.set(name, value),
            options,
        );
    }

    /**
     * Retrieves the value of the specified environment variable.
     *
     * @param name - The name of the environment variable.
     * @returns The value of the environment variable, or `undefined` if it is not set.
     * @example
     * ```ts
     * import { env } from "@bearz/env";
     *
     * console.log(env.get("HOME")); // /home/alice
     * ```
     */
    get(name: string): string | undefined {
        return this.proxy[name];
    }

    getArray(name: string, separator: string = ","): string[] | undefined {
        const value = this.get(name);
        if (value === undefined) {
            return undefined;
        }

        return value.split(separator);
    }

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
    getBool(name: string): boolean | undefined {
        const value = this.get(name);
        if (value === undefined) {
            return undefined;
        }

        if (value === "null") {
            return undefined;
        }

        return value === "1" || value === "true" || equalFold(value, "true");
    }

    /**
     * Retrieves the binary data associated with the specified name.
     *
     * @description
     * The binary data is expected to be encoded as a base64 string.
     *
     * @param name - The name of the binary data.
     * @returns The binary data as a Uint8Array, or undefined if the binary data is not found or empty.
     */
    getBinary(name: string): Uint8Array | undefined {
        let value = this.get(name);
        if (value === undefined) {
            return undefined;
        }

        value = value.trim();
        if (value.length === 0) {
            return undefined;
        }

        return decodeBase64(value);
    }

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
    getNumber(name: string): number | undefined {
        const value = this.get(name);
        if (value === undefined) {
            return undefined;
        }

        const n = Number(value);
        if (isNaN(n)) {
            return undefined;
        }

        return n;
    }

    /**
     * Retrieves the integer value associated with the specified name from the environment.
     *
     * @param name - The name of the environment variable.
     * @param radix - An optional radix (base) for parsing the value. Defaults to 10 if not provided.
     * @returns The parsed integer value, or `undefined` if the value is not found or cannot be parsed as an integer.
     */
    getInt(name: string, radix?: number): number | undefined {
        const value = this.get(name);
        if (value === undefined) {
            return undefined;
        }

        const i = parseInt(value, radix);
        if (isNaN(i)) {
            return undefined;
        }

        return i;
    }

    /**
     * Retrieves the value associated with the specified name and converts it to a Date object.
     *
     * @param name - The name of the value to retrieve.
     * @returns The Date object representing the value, or undefined if the value is not found.
     */
    getDate(name: string): Date | undefined {
        const value = this.get(name);
        if (value === undefined) {
            return undefined;
        }

        const d = new Date(value);
        if (d.toString() === "Invalid Date") {
            return undefined;
        }

        return d;
    }

    /**
     * Retrieves a JSON value from the environment variables by name.
     *
     * @param name - The name of the environment variable.
     * @returns The parsed JSON value if it exists, otherwise undefined.
     * @template T - The type of the parsed JSON value. Defaults to `unknown`.
     */
    getJson<T = unknown>(name: string): T | undefined {
        const value = this.get(name);
        if (value === undefined) {
            return undefined;
        }

        try {
            const v = JSON.parse(value);
            if (v === undefined) {
                return v;
            }

            if (v === null) {
                return undefined;
            }

            return v as T;
        } catch {
            return undefined;
        }
    }

    /**
     * Retrieves the value of the specified environment variable.
     * If the environment variable is not set, throws an error.
     *
     * @param name - The name of the environment variable.
     * @returns The value of the environment variable.
     * @throws {Error} If the environment variable is not set.
     */
    require(name: string): string {
        const value = this.get(name);
        if (value === undefined) {
            throw new Error(`Environment variable ${name} is not set`);
        }
        return value;
    }

    /**
     * Sets the value of the specified environment variable.
     *
     * @param name - The name of the environment variable.
     * @param value - The value to set.
     * @returns The updated instance of the `EnvBrowser` class.
     */
    set(name: string, value: string): this {
        this.proxy[name] = value;
        return this;
    }

    /**
     * Merges the provided environment variables into the current environment.
     * @param env - The environment variables to merge.
     * @returns The updated instance of the `EnvBrowser` class.
     */
    merge(env: Record<string, string | undefined>): this {
        for (const key of Object.keys(env)) {
            const value = env[key];
            if (value === undefined) {
                delete this.proxy[key];
            } else {
                this.proxy[key] = value;
            }
        }

        return this;
    }

    /**
     * Checks if the specified environment variable is set.
     *
     * @param name - The name of the environment variable.
     * @returns `true` if the environment variable is set, `false` otherwise.
     */
    has(name: string): boolean {
        return this.proxy[name] !== undefined;
    }

    *[Symbol.iterator](): IterableIterator<{ key: string; value: string }> {
        for (const key of Object.keys(this.proxy)) {
            const value = this.proxy[key];
            if (value === undefined) {
                continue;
            }

            yield { key, value: value };
        }
    }

    /**
     * Removes the specified environment variable.
     *
     * @param name - The name of the environment variable to remove.
     */
    remove(name: string): this {
        delete this.proxy[name];
        return this;
    }

    /**
     * Returns the environment variables as a record of key-value pairs.
     *
     * @returns The environment variables as a record of key-value pairs.
     */
    toObject(): Record<string, string | undefined> {
        return Object.assign({}, this.#proxy);
    }

    /**
     * Prints the environment variables to the console.
     */
    dump(): void {
        const values = this.toObject();
        for (const key of Object.keys(values)) {
            console.log(`${key}=${values[key]}`);
        }
    }

    /**
     * Joins an array of paths into a single path string.
     *
     * @param paths - An array of paths to be joined.
     * @returns The joined path string.
     */
    joinPath(paths: string[]): string {
        return paths.join(SEP);
    }

    /**
     * Initializes the path and proxy objects
     */
    protected init() {
        this.path = new DefaultEnvPath(this);
        this.proxy = {} as Record<string, string | undefined>;
    }
}
