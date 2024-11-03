import { DefaultEnvPath, EnvBase } from "../base/mod.ts";
import type { Env } from "../types.ts";

// deno-lint-ignore no-explicit-any
const g = globalThis as any;
const deno = g.Deno;

const proxy = new Proxy({}, {
    get(_target, name) {
        return deno.env.get(name as string);
    },
    set(_target, name, value) {
        deno.env.set(name as string, value as string);
        return true;
    },
    deleteProperty(_target, name) {
        deno.env.delete(name as string);
        return true;
    },
    has(_target, name) {
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

/**
 * Represents the environment variables and provides methods to interact with them.
 */
class DenoEnv extends EnvBase {
    protected override init(): void {
        super.proxy = proxy;
        super.path = new DefaultEnvPath(this);
    }

    /**
     * Retrieves the value of the specified environment variable.
     *
     * @param name The name of the environment variable.
     * @returns The value of the environment variable, or `undefined` if it is not set.
     */
    override get(name: string): string | undefined {
        return deno.env.get(name);
    }

    /**
     * Merges the provided environment variables into the current environment.
     * @param env The environment variables to merge.
     * @returns The updated instance of the `EnvBrowser` class.
     */
    override merge(env: Record<string, string | undefined>): this {
        for (const key of Object.keys(env)) {
            const value = env[key];
            if (value === undefined) {
                deno.env.delete(key);
            } else {
                deno.env.set(key, value);
            }
        }

        return this;
    }

    /**
     * Sets the value of the specified environment variable.
     *
     * @param name The name of the environment variable.
     * @param value The value to set.
     */
    override set(name: string, value: string): this {
        deno.env.set(name, value);
        return this;
    }

    /**
     * Checks if the specified environment variable is set.
     *
     * @param name The name of the environment variable.
     * @returns `true` if the environment variable is set, `false` otherwise.
     */
    override has(name: string): boolean {
        return deno.env.has(name);
    }

    /**
     * Returns an iterator for the environment variables.
     */
    override *[Symbol.iterator](): IterableIterator<{ key: string; value: string }> {
        for (const key of Object.keys(deno.env.toObject())) {
            const value = deno.env.get(key);
            if (value === undefined) {
                continue;
            }

            yield { key, value: value };
        }
    }

    /**
     * Removes the specified environment variable.
     *
     * @param name The name of the environment variable to remove.
     */
    override remove(name: string): this {
        deno.env.delete(name);
        return this;
    }

    /**
     * Returns the environment variables as a record of key-value pairs.
     *
     * @returns The environment variables as a record of key-value pairs.
     */
    override toObject(): Record<string, string | undefined> {
        return deno.env.toObject();
    }

    /**
     * Prints the environment variables to the console.
     */
    override dump(): void {
        const values = deno.env.toObject();
        for (const key of Object.keys(values)) {
            console.log(`${key}=${values[key]}`);
        }
    }
}

export const env: Env = new DenoEnv();
