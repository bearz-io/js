import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("curl", {
    name: "curl",
    envVariable: "CURL_EXE",
    windows: ["${SystemRoot}\\System32\\curl.exe"],
    linux: ["/usr/bin/curl"],
});

/**
 * Represents an curl command.
 */
export class CurlCommand extends Command {
    /**
     * Represents the curl CLI command.
     * @param args - The command arguments.
     * @param options - The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("curl", args, options);
    }
}

/**
 * Invokes the `curl` cli.
 *
 * @param args - The command arguments.
 * @param options - The command options.
 * @returns A new instance of the CurlCommand class.
 * @see {CurlCommand}
 * @example
 * ```ts
 * import { curl } from "@spawn/curl"
 *
 * const result = await curl("https://bing.com");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function curl(args?: CommandArgs, options?: CommandOptions): CurlCommand {
    return new CurlCommand(args, options);
}
