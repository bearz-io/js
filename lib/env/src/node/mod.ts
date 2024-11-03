import process from "node:process";
import type { Env } from "../types.ts";
import { DefaultEnvPath, EnvBase } from "../base/mod.ts";
const proc = process;

if (!proc) {
    throw new Error("The process global variable is not available.");
}

/**
 * The node implementation of the `Env` interface.
 */
class NodeEnv extends EnvBase {
    protected override init(): void {
        super.proxy = proc.env;
        super.path = new DefaultEnvPath(this);
    }

    /**
     * Retrieves the value of the specified environment variable.
     *
     * @param name The name of the environment variable.
     * @returns The value of the environment variable, or `undefined` if it is not set.
     */
    override get(name: string): string | undefined {
        return proc.env[name];
    }

    /**
     * Sets the value of the specified environment variable.
     *
     * @param name The name of the environment variable.
     * @param value The value to set.
     */
    override set(name: string, value: string): this {
        proc.env[name] = value;
        return this;
    }

    /**
     * Checks if the specified environment variable is set.
     *
     * @param name The name of the environment variable.
     * @returns `true` if the environment variable is set, `false` otherwise.
     */
    override has(name: string): boolean {
        const value = proc.env[name];
        return value !== undefined && value !== null;
    }

    /**
     * Removes the specified environment variable.
     *
     * @param name The name of the environment variable to remove.
     */
    override remove(name: string): this {
        delete proc.env[name];
        return this;
    }

    /**
     * Returns the environment variables as a record of key-value pairs.
     *
     * @returns The environment variables as a record of key-value pairs.
     */
    override toObject(): Record<string, string | undefined> {
        return Object.assign({}, proc.env);
    }
}

export const env: Env = new NodeEnv();
