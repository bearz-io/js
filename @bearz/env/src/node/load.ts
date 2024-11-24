import { Env } from "../env_abstractions.ts";
import process from "node:process";

Object.defineProperty(Env.prototype, "proxy", {
    get: function () {
        return process.env;
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

/**
 * Retrieves the value of the specified environment variable.
 *
 * @param name The name of the environment variable.
 * @returns The value of the environment variable, or `undefined` if it is not set.
 */
Env.prototype.get = function (name: string): string | undefined {
    return process.env[name];
};

/**
 * Sets the value of the specified environment variable.
 *
 * @param name The name of the environment variable.
 * @param value The value to set.
 */
Env.prototype.set = function (name: string, value: string): Env {
    process.env[name] = value;
    return this;
};

/**
 * Checks if the specified environment variable is set.
 *
 * @param name The name of the environment variable.
 * @returns `true` if the environment variable is set, `false` otherwise.
 */
Env.prototype.has = function (name: string): boolean {
    const value = process.env[name];
    return value !== undefined && value !== null;
};

/**
 * Removes the specified environment variable.
 *
 * @param name The name of the environment variable to remove.
 */
Env.prototype.remove = function (name: string): Env {
    delete process.env[name];
    return this;
};

/**
 * Returns the environment variables as a record of key-value pairs.
 *
 * @returns The environment variables as a record of key-value pairs.
 */
Env.prototype.toObject = function (): Record<string, string | undefined> {
    return Object.assign({}, process.env);
};
