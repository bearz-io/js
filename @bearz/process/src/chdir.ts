/**
 * Error thrown when the there is an error changing the directory.
 */
export class ChangeDirectoryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ChangeDirectoryError";
    }
}

/**
 * Updates the current working directory of the process. In
 * the browser environment, this function calls pushState
 *
 * @param directory The directory to change to.
 * @throws ChangeDirectoryError if chdir is not implemented, if the directory is not found,
 * or if the runtime does not support changing the directory.
 */
// deno-lint-ignore no-unused-vars
let chdir = function (directory: string): void {
    throw new ChangeDirectoryError("chdir is not implemented");
};

const g = globalThis as Record<string, unknown>;
if (g.Deno) {
    /**
     * Updates the current working directory of the process. In
     * the browser environment, this function calls pushState
     *
     * @param directory The directory to change to.
     * @throws ChangeDirectoryError if chdir is not implemented, if the directory is not found,
     * or if the runtime does not support changing the directory.
     */
    chdir = function (directory: string): void {
        try {
            Deno.chdir(directory);
        } catch (e) {
            const e2 = e as Error;
            const ex = new ChangeDirectoryError(e2.message);
            ex.cause = e2;
            throw ex;
        }
    };
} else if (g.process) {
    const { process } = await import("./process.ts");
    /**
     * Updates the current working directory of the process. In
     * the browser environment, this function calls pushState
     *
     * @param directory The directory to change to.
     * @throws ChangeDirectoryError if chdir is not implemented, if the directory is not found,
     * or if the runtime does not support changing the directory.
     */
    chdir = function (directory: string): void {
        try {
            process.chdir(directory);
        } catch (e) {
            const e2 = e as Error;
            const ex = new ChangeDirectoryError(e2.message);
            ex.cause = e2;
            throw ex;
        }
    };
} else if (g.navigator) {
    // deno-lint-ignore no-explicit-any
    const window = g.window as Record<string, any>;
    if (typeof window.history !== "undefined") {
        /**
         * Updates the current working directory of the process. In
         * the browser environment, this function calls pushState
         *
         * @param directory The directory to change to.
         * @throws Error if chdir is not implemented.
         * @throws Error if diirector is not found;
         */

        chdir = function (directory: string): void {
            window.history.pushState({ url: directory }, "", directory);
        };
    }
}

export { chdir };
