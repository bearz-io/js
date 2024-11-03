let logger: undefined | ((file: string, args?: string[]) => void) = undefined;

/**
 * Set the default logger function to write
 * commands when they are invoked.
 *
 * @param defaultLogger The logger function to use.
 * @example
 * ```typescript
 * import { setLogger } from "@bearz/exec/set-logger";
 * setLogger(console.log);
 * ```
 */
export function setLogger(defaultLogger?: (file: string, args?: string[]) => void): void {
    logger = defaultLogger;
}

/**
 * Gets the default logger function.
 * @returns The default logger function.
 */
export function getLogger(): undefined | ((file: string, args?: string[]) => void) {
    return logger;
}
