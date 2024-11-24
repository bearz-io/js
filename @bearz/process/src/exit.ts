/**
 * Exits the process with the specified exit code.
 * @param code The exit code.
 * @throws Error if exit is not implemented.
 */
// deno-lint-ignore no-unused-vars
let exit = function (code?: number): void {
    throw new Error("exit is not implemented");
};

const g = globalThis as Record<string, unknown>;
if (g.Deno) {
    /**
     * Exits the process with the specified exit code.
     * @param code The exit code.
     * @throws Error if exit is not implemented.
     */
    exit = function (code?: number): void {
        Deno.exit(code);
    };
} else if (g.process) {
    const process = g.process as NodeJS.Process;
    /**
     * Exits the process with the specified exit code.
     * @param code The exit code.
     * @throws Error if exit is not implemented.
     */
    exit = function (code?: number): void {
        process.exit(code);
    };
} else if (g.navigator) {
    const window = g.window as Window;
    /**
     * Exits the process with the specified exit code.
     * @param code The exit code.
     * @throws Error if exit is not implemented.
     */
    // deno-lint-ignore no-unused-vars
    exit = function (code?: number): void {
        window.close();
    };
}

export { exit };
