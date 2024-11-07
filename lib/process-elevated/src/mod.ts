/**
 * ## Overview
 *
 * Determines if the current process is elevated.  The function
 * checks if the process is running as root on linux and Mac.  The
 * function will check to see if the process is elevated by Adminstrator
 * or a priveleged account.
 *
 * ## Documentation
 *
 * Documentation is available on [jsr.io](https://jsr.io/@bearz/process-elevated/doc)
 *
 * ## Usage
 * ```typescript
 * import { proccessElevated } from "@bearz/process-elevated";
 *
 * if (!processElevated()) {
 *     throw new Error("action requres sudo or admin rights");
 * }
 *
 * ```
 *
 * ## License
 *
 * [MIT License](./LICENSE.md)
 */

let elevated: boolean | undefined;
// deno-lint-ignore no-unused-vars
let processElevated = function (cache = true): boolean {
    return false;
};

if (Deno.build.os === "windows") {
    const advapi32 = Deno.dlopen("Advapi32.dll", {
        OpenProcessToken: {
            parameters: ["pointer", "u32", "pointer"],
            result: "bool",
        },
        GetTokenInformation: {
            parameters: ["u64", "u32", "pointer", "u32", "pointer"],
            result: "bool",
        },
    });

    const kernel32 = Deno.dlopen("Kernel32.dll", {
        GetCurrentProcess: {
            parameters: [],
            result: "pointer",
        },
        CloseHandle: {
            parameters: ["pointer"],
            result: "bool",
        },
        GetLastError: { parameters: [], result: "i32" },
    });

    /**
     * Checks if the current process is running with elevated privileges (e.g., as an administrator on Windows or as root on Unix-like systems).
     *
     * On Windows, it uses the `Advapi32.dll` and `Kernel32.dll` libraries to check the token elevation status.
     * On Unix-like systems, it checks if the user ID is 0 (root).
     *
     * @param {boolean} [cache=true] Whether to use the cached result if available. If `false`, the elevation status will be re-evaluated.
     * @returns {boolean} `true` if the process is running with elevated privileges, `false` otherwise.
     * @throws {Error} Throws an error if it fails to open the process token or get token information on Windows.
     */
    processElevated = function (cache = true): boolean {
        if (cache && elevated !== undefined) {
            return elevated;
        }

        // TOKEN_QUERY = 0x0008
        const TOKEN_QUERY = 0x0008;

        // Get the current process handle
        const processHandle = kernel32.symbols.GetCurrentProcess();

        // Create a buffer for the token handle
        const tokenHandle = new BigUint64Array(1);
        const tokenHandlePtr = Deno.UnsafePointer.of(tokenHandle);

        // Try to open the process token
        const success = advapi32.symbols.OpenProcessToken(
            processHandle,
            TOKEN_QUERY,
            tokenHandlePtr,
        );

        if (!success) {
            throw new Error("Failed to open process token");
        }

        try {
            // Get token elevation information
            const TOKEN_ELEVATION = 20;
            const tokenInfo = new Uint8Array(4);
            const returnLength = new Uint32Array(1);

            const result = advapi32.symbols.GetTokenInformation(
                tokenHandle[0],
                TOKEN_ELEVATION,
                Deno.UnsafePointer.of(tokenInfo),
                4,
                Deno.UnsafePointer.of(returnLength),
            );

            if (!result) {
                const error = kernel32.symbols.GetLastError();
                throw new Error(`Failed to get token information ${error}`);
            }

            // First 4 bytes contain the elevation status
            elevated = tokenInfo[0] !== 0;
            return elevated;
        } finally {
            // Clean up the handle
            kernel32.symbols.CloseHandle(tokenHandlePtr);
        }
    };
} else {
    /**
     * Checks if the current process is running with elevated privileges (e.g., as an administrator on Windows or as root on Unix-like systems).
     *
     * On Windows, it uses the `Advapi32.dll` and `Kernel32.dll` libraries to check the token elevation status.
     * On Unix-like systems, it checks if the user ID is 0 (root).
     *
     * @param {boolean} [cache=true] - Whether to use the cached result if available. If `false`, the elevation status will be re-evaluated.
     * @returns {boolean} - `true` if the process is running with elevated privileges, `false` otherwise.
     * @throws {Error} - Throws an error if it fails to open the process token or get token information on Windows.
     */
    processElevated = function (cache = true): boolean {
        if (!cache || elevated === undefined) {
            elevated = Deno.uid() === 0;
        }

        return elevated;
    };
}

export { processElevated };
