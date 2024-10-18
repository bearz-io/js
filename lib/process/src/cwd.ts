/**
 * Gets the current working directory of the process.
 * In the browser environment, this function returns the
 * current URL or the last URL in the history if its
 * stored in the state.
 *
 * @returns The current working directory.
 * @throws Error if cwd is not implemented or if the runtime does not support
 * getting the current working directory.
 */
let cwd = function (): string {
    throw new Error("cwd is not implemented");
};

const g = globalThis as Record<string, unknown>;
if (g.Deno) {
    cwd = function (): string {
        return Deno.cwd();
    };
} else if (g.process) {
    const process = g.process as NodeJS.Process;
    cwd = function (): string {
        return process.cwd();
    };
} else if (g.navigator) {
    // deno-lint-ignore no-explicit-any
    const window = g.window as Record<string, any>;

    if (window.history) {
        cwd = function (): string {
            if (window.history && window.history.state && window.history.state.url) {
                return window.history.state.url as string;
            }

            return window.location.pathname as string;
        };
    }
}

export { cwd };
