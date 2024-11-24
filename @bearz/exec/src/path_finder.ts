import { equalFold } from "@bearz/strings/equal";
import { env } from "@bearz/env";
import { underscore } from "@bearz/strings/underscore";
import { which, whichSync } from "./which.ts";
import { isFile, isFileSync } from "@bearz/fs";
import { DARWIN, WINDOWS } from "@bearz/runtime-info/os";

/**
 * Represents the options for the path finder.
 */
export interface PathFinderOptions {
    /**
     * The name of the path finder.
     */
    name: string;

    /**
     * The executable path for the path finder.
     */
    executable?: string;

    /**
     * The environment variable for the path finder.
     */
    envVariable?: string;

    /**
     * The cached path for the path finder.
     */
    cached?: string;

    /**
     * A flag indicating if the cached path should be ignored.
     */
    noCache?: boolean;

    /**
     * An array of additional paths for the path finder on Windows.
     * Environment variables can be used in the paths.
     *
     * @example
     * ```ts
     * import { pathFinder } from "./path-finder.ts";
     *
     * pathFinder.set("deno", {
     *  name: "deno",
     *  windows: ["${USER}\\.deno\\bin\\deno.exe"],
     * })
     */
    windows?: string[];

    /**
     * An array of additional paths for the path finder on Darwin.
     * Environment variables can be used in the paths.
     *
     * @example
     * ```ts
     * import { pathFinder } from "./path-finder.ts";
     *
     * pathFinder.set("deno", {
     *  name: "deno",
     *  linux: ["${USER}/.deno/bin/deno"],
     * })
     * ```
     */
    linux?: string[];

    /**
     * An array of additional paths for the path finder on Darwin.
     * Environment variables can be used in the paths.
     *
     * @example
     * ```ts
     * import { pathFinder } from "./path-finder.ts";
     *
     * pathFinder.set("deno", {
     *  name: "deno",
     *  darwin: ["${USER}/.deno/bin/deno"],
     * })
     * ```
     */
    darwin?: string[];
}

/**
 * Represents a path finder that allows storing and retrieving
 * options for finding an executable and methods to find the
 * executable.
 *
 * The path finder will use the options to look up by precendence:
 *
 * - If the full path to the executable is provided, it will be used.
 * - If an environment variable is provided, it will be used.
 * - If a cached path is provided, it will be used.
 * - If the executable is found in the system path, it will be used.
 * - If the executable is found in the windows paths when on Windows, it will be used.
 * - If the executable is found in the darwin paths when on Darwin or linux paths, it will be used.
 * - If the executable is found in the linux paths, it will be used.
 *
 * The paths for windows, darwin, and linux can contain environment variables e.g.
 * `${USERPROFILE}`, `${USER}`, or `%USERPROFILE% that will be expanded before checking if the file exists.
 * @example
 * ```ts
 * import { pathFinder } from "./path-finder.ts";
 *
 * pathFinder.set("deno", {
 *    name: "deno",
 *    envVariable: "DENO_EXE",
 *    windows: ["${USERPROFILE}\\.deno\\bin\\deno.exe"],
 *    linux: ["${USER}/.deno/bin/deno"],
 * });
 *
 * const deno = await pathFinder.findExe("deno");
 * console.log(deno);
 * ```
 */
export class PathFinder {
    #map: Map<string, PathFinderOptions>;

    constructor() {
        this.#map = new Map();
    }

    /**
     * Sets the path finder options for a given name.
     * @param name - The name of the path finder.
     * @param options - The path finder options.
     */
    set(name: string, options: PathFinderOptions) {
        this.#map.set(name, options);
    }

    /**
     * Retrieves the path finder options for a given name.
     * @param name - The name of the path finder.
     * @returns The path finder options, or undefined if not found.
     */
    get(name: string): PathFinderOptions | undefined {
        return this.#map.get(name);
    }

    /**
     * Checks if a path finder with the given name exists.
     * @param name - The name of the path finder.
     * @returns True if the path finder exists, false otherwise.
     */
    has(name: string): boolean {
        return this.#map.has(name);
    }

    /**
     * Deletes the path finder with the given name.
     * @param name - The name of the path finder.
     * @returns True if the path finder was deleted, false otherwise.
     */
    delete(name: string): boolean {
        return this.#map.delete(name);
    }

    /**
     * Clears all path finders.
     */
    clear() {
        this.#map.clear();
    }

    /**
     * Finds the path finder options for a given name.
     * @param name - The name of the path finder.
     * @returns The path finder options, or undefined if not found.
     */
    find(name: string): PathFinderOptions | undefined {
        const options = this.get(name);
        if (!options) {
            return;
        }

        for (const [key, value] of this.#map) {
            if (value.name === name) {
                return value;
            }

            if (value.cached === name) {
                return value;
            }

            if (equalFold(key, name)) {
                return value;
            }
        }

        return undefined;
    }

    /**
     * Finds the executable path for a given name.
     * @param name - The name of the executable.
     * @returns The executable path, or undefined if not found.
     */
    async findExe(name: string): Promise<string | undefined> {
        let options = this.find(name);
        if (!options) {
            options = {
                name: name,
                envVariable: (underscore(name) + "_EXE").toUpperCase(),
            } as PathFinderOptions;

            this.set(name, options);
        }

        if (options?.envVariable) {
            let envPath = env.get(options.envVariable);
            if (!options.noCache && envPath && envPath.length > 0 && options.cached === envPath) {
                return envPath;
            }

            envPath = env.expand(envPath ?? "");
            if (!options.noCache && envPath && envPath.length > 0 && options.cached === envPath) {
                return envPath;
            }

            if (envPath && await isFile(envPath)) {
                options.cached = envPath;
                return envPath;
            }
        }

        if (!options.noCache && options.cached) {
            return options.cached;
        }

        const defaultPath = await which(name);
        if (defaultPath) {
            options.cached = defaultPath;
            return defaultPath;
        }

        if (WINDOWS) {
            if (options.windows && options.windows.length) {
                for (const path of options.windows) {
                    let next = path;
                    next = env.expand(next);

                    if (await isFile(next)) {
                        options.cached = next;
                        return next;
                    }
                }
            }

            return undefined;
        }

        if (DARWIN) {
            if (options.darwin && options.darwin.length) {
                for (const path of options.darwin) {
                    let next = path;
                    next = env.expand(next);

                    if (await isFile(next)) {
                        options.cached = next;
                        return next;
                    }
                }
            }

            // allow darwin to use linux paths
            // do not return here
        }

        if (options.linux && options.linux.length) {
            for (const path of options.linux) {
                let next = path;
                next = env.expand(next);

                if (await isFile(next)) {
                    options.cached = next;
                    return next;
                }
            }
        }

        return undefined;
    }

    /**
     * Synchronously finds the executable path for a given name.
     * @param name - The name of the executable.
     * @returns The executable path, or undefined if not found.
     */
    findExeSync(name: string): string | undefined {
        let options = this.find(name);
        if (!options) {
            options = {
                name: name,
                envVariable: (underscore(name) + "_EXE").toUpperCase(),
            } as PathFinderOptions;

            this.set(name, options);
        }

        if (options?.envVariable) {
            let envPath = env.get(options.envVariable);
            if (!options.noCache && envPath && envPath.length > 0 && options.cached === envPath) {
                return envPath;
            }

            envPath = env.expand(envPath ?? "");
            if (!options.noCache && envPath && envPath.length > 0 && options.cached === envPath) {
                return envPath;
            }

            if (envPath) {
                if (envPath && isFileSync(envPath)) {
                    options.cached = envPath;
                    return envPath;
                }
            }
        }

        if (!options.noCache && options.cached) {
            return options.cached;
        }

        const defaultPath = whichSync(name);
        if (defaultPath) {
            options.cached = defaultPath;
            return defaultPath;
        }

        if (WINDOWS) {
            if (options.windows && options.windows.length) {
                for (const path of options.windows) {
                    let next = path;
                    try {
                        next = env.expand(next);
                    } catch {
                        continue;
                    }

                    if (isFileSync(next)) {
                        options.cached = next;
                        return next;
                    }
                }
            }

            return undefined;
        }

        if (DARWIN) {
            if (options.darwin && options.darwin.length) {
                for (const path of options.darwin) {
                    let next = path;
                    try {
                        next = env.expand(next);
                    } catch {
                        // todo: get trace/debug writer to handle
                        continue;
                    }

                    if (isFileSync(next)) {
                        options.cached = next;
                        return next;
                    }
                }
            }

            // allow darwin to use linux paths
            // do not return here
        }

        if (options.linux && options.linux.length) {
            for (const path of options.linux) {
                let next = path;
                try {
                    next = env.expand(next);
                } catch {
                    continue;
                }

                if (isFileSync(next)) {
                    options.cached = next;
                    return next;
                }
            }
        }

        return undefined;
    }
}

/**
 * The default global path finder instance.
 */
export const pathFinder: PathFinder = new PathFinder();
