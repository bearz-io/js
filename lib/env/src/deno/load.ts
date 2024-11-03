import { Env } from "../env_abstractions.ts";

// deno-lint-ignore no-explicit-any
const g = globalThis as any;
const deno = g.Deno;

const proxy = new Proxy({}, {
    get(_target, name) {
        if (typeof name !== "string" || name === "") {
            return undefined;
        }

        return deno.env.get(name as string);
    },
    set(_target, name, value) {
        if (typeof name !== "string" || name === "") {
            return false;
        }

        deno.env.set(name as string, value as string);
        return true;
    },
    deleteProperty(_target, name) {
        if (typeof name !== "string" || name === "") {
            return false;
        }

        deno.env.delete(name as string);
        return true;
    },
    has(_target, name) {
        if (typeof name !== "string" || name === "") {
            return false;
        }

        return deno.env.get(name as string) !== undefined;
    },
    ownKeys(_target) {
        return Object.keys(deno.env.toObject());
    },
    getOwnPropertyDescriptor(_target, name) {
        return {
            value: deno.env.get(name as string),
            writable: true,
            enumerable: true,
            configurable: true,
        };
    },
});

Object.defineProperty(Env.prototype, "proxy", {
    value: proxy,
    writable: false,
    enumerable: false,
    configurable: false,
});

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
Env.prototype.get = function (name: string): string | undefined {
    return deno.env.get(name);
};

/**
 * Merges the provided environment variables into the current environment.
 * @param env The environment variables to merge.
 * @returns The updated instance of the `EnvBrowser` class.
 */
Env.prototype.merge = function (env: Record<string, string | undefined>): Env {
    for (const key of Object.keys(env)) {
        const value = env[key];
        if (value === undefined) {
            deno.env.delete(key);
        } else {
            deno.env.set(key, value);
        }
    }

    return this;
};

/**
 * Sets the value of the specified environment variable.
 *
 * @param name The name of the environment variable.
 * @param value The value to set.
 */
Env.prototype.set = function (name: string, value: string): Env {
    deno.env.set(name, value);
    return this;
};

/**
 * Checks if the specified environment variable is set.
 *
 * @param name The name of the environment variable.
 * @returns `true` if the environment variable is set, `false` otherwise.
 */
Env.prototype.has = function (name: string): boolean {
    return deno.env.has(name);
};

/**
 * Returns an iterator for the environment variables.
 */
Env.prototype[Symbol.iterator] = function* (): IterableIterator<{ key: string; value: string }> {
    for (const key of Object.keys(deno.env.toObject())) {
        const value = deno.env.get(key);
        if (value === undefined) {
            continue;
        }

        yield { key, value: value };
    }
};

/**
 * Removes the specified environment variable.
 *
 * @param name - The name of the environment variable to remove.
 */
Env.prototype.remove = function (name: string): Env {
    deno.env.delete(name);
    return this;
};

/**
 * Returns the environment variables as a record of key-value pairs.
 *
 * @returns The environment variables as a record of key-value pairs.
 */
Env.prototype.toObject = function (): Record<string, string | undefined> {
    return deno.env.toObject();
};

/**
 * Prints the environment variables to the console.
 */
Env.prototype.dump = function (): void {
    const values = deno.env.toObject();
    for (const key of Object.keys(values)) {
        console.log(`${key}=${values[key]}`);
    }
};
