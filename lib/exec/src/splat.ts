import { dasherize } from "@bearz/strings/dasherize";
import type { SplatObject, SplatOptions } from "./types.ts";

export type { SplatObject, SplatOptions };

const match = (array: unknown[], value: string) =>
    array.some((
        element,
    ) => (element instanceof RegExp ? element.test(value) : element === value));

/**
 * Converts an object to an `string[]` of command line arguments.
 *
 * @description
 * This is a modified version of the dargs npm package.  Its useful for converting an object to an array of command line arguments
 * especially when using typescript interfaces to provide intellisense and type checking for command line arguments
 * for an executable or commands in an executable.
 *
 * The code https://github.com/sindresorhus/dargs which is under under MIT License.
 * The original code is Copyrighted under (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 * @param object The object to convert
 * @param options The options to use
 * @returns An array of command line arguments
 * @example
 * ```ts
 * const args = splat({ foo: "bar" });
 * console.log(args); // ["--foo", "bar"]
 * ```
 */
export function splat(
    object: Record<string, unknown> | SplatObject,
    options?: SplatOptions,
): string[] {
    const splat = [];
    let extraArguments = [];
    let separatedArguments = [];

    if (object.splat) {
        options = {
            ...object.splat,
            ...options,
        };

        delete object.splat;
    }

    options = {
        shortFlag: true,
        prefix: "--",
        ...options,
    };

    const makeArguments = (key: string, value?: unknown) => {
        const prefix = options?.shortFlag && key.length === 1 ? "-" : options?.prefix;
        const theKey = options?.preserveCase ? key : dasherize(key);

        key = prefix + theKey;

        if (options?.assign) {
            splat.push(key + (value ? `${options.assign}${value}` : ""));
        } else {
            splat.push(key);
            if (value) {
                splat.push(value);
            }
        }
    };

    const makeAliasArg = (key: string, value?: unknown) => {
        splat.push(`-${key}`);

        if (value) {
            splat.push(value);
        }
    };

    let isNoFlag = (_key: string): boolean => {
        return false;
    };

    if (options.noFlags !== undefined) {
        if (options.noFlagValues === undefined) {
            options.noFlagValues = { t: "true", f: "false" };
        }

        if (Array.isArray(options.noFlags)) {
            isNoFlag = (key) => (options.noFlags as string[]).includes(key);
        } else {
            isNoFlag = (_key) => true;
        }
    }

    let argz: unknown[] = [];
    if (object.arguments && Array.isArray(object.arguments)) {
        argz = object.arguments;
    } else if (options.arguments?.length) {
        argz.length = options.arguments.length;
    }

    for (let [key, value] of Object.entries(object)) {
        let pushArguments = makeArguments;

        if (options.arguments?.length && options.arguments.includes(key)) {
            // ensure the order of the arguments
            const index = options.arguments.indexOf(key);
            if (value) {
                argz[index] = value;
            }

            continue;
        }

        if (Array.isArray(options.excludes) && match(options.excludes, key)) {
            continue;
        }

        if (Array.isArray(options.includes) && !match(options.includes, key)) {
            continue;
        }

        if (typeof options.aliases === "object" && options.aliases[key]) {
            key = options.aliases[key];
            pushArguments = makeAliasArg;
        }

        if (key === "--") {
            if (!Array.isArray(value)) {
                throw new TypeError(
                    `Expected key \`--\` to be Array, got ${typeof value}`,
                );
            }

            separatedArguments = value;
            continue;
        }

        if (key === "_") {
            if (typeof value === "string") {
                extraArguments = [value];
                continue;
            }

            if (!Array.isArray(value)) {
                throw new TypeError(
                    `Expected key \`_\` to be Array, got ${typeof value}`,
                );
            }

            extraArguments = value;
            continue;
        }

        if (value === true && !options.ignoreTrue) {
            if (isNoFlag(key)) {
                pushArguments(key, options.noFlagValues?.t);
            } else {
                pushArguments(key);
            }
        }

        if (value === false && !options.ignoreFalse) {
            if (isNoFlag(key)) {
                pushArguments(key, options.noFlagValues?.f);
            } else {
                pushArguments(`no-${key}`);
            }
        }

        if (typeof value === "string") {
            pushArguments(key, value);
        }

        if (typeof value === "number" && !Number.isNaN(value)) {
            pushArguments(key, String(value));
        }

        if (Array.isArray(value)) {
            for (const arrayValue of value) {
                pushArguments(key, arrayValue);
            }
        }
    }

    for (const argument of extraArguments) {
        splat.unshift(String(argument));
    }

    if (separatedArguments.length > 0) {
        splat.push("--");
    }

    for (const argument of separatedArguments) {
        splat.push(String(argument));
    }

    if (argz.length) {
        const unwrapped: string[] = [];
        // ensure the order of the arguments
        for (const arg of argz) {
            if (arg) {
                if (Array.isArray(arg)) {
                    unwrapped.push(...arg.map((a) => String(a)));
                } else {
                    unwrapped.push(String(arg));
                }
            }
        }

        if (options.appendArguments) {
            splat.push(...unwrapped);
        } else {
            splat.unshift(...unwrapped);
        }
    }

    // add the command to the beginning of the parameters
    if (options?.command?.length) {
        if (typeof options.command === "string") {
            options.command = options.command.split(" ").filter((c) => c.trim().length > 0);
        }

        splat.unshift(...options.command);
    }

    return splat;
}
