/**
 * The context module represents the `docker context` sub commands.
 *
 * @module
 */

import { type CommandOptions, splat, type SplatObject } from "@bearz/exec";
import { docker, type DockerCommand } from "../command.ts";

/**
 * Represents the arguments for a Docker context command.
 */
export interface DockerContextArgs extends SplatObject {
    /**
     * The name of the context.
     */
    context: string;

    /**
     * Show help information.
     */
    help?: boolean;
}

/**
 * Represents the arguments for a Docker context remove command.
 */
export interface DockerRemoveContextArgs extends DockerContextArgs {
    force?: boolean;
}

/**
 * Represents the arguments for a Docker context create or update command.
 */
export interface DockerCreateContextArgs extends DockerContextArgs {
    /**
     * The --docker endpoint for the context.
     */
    docker?: {
        /**
         * The Docker host endpoint.
         */
        host: string;
        /**
         * The path to the CA certificate.
         */
        ca?: string;
        /**
         * The path to the client certificate.
         */
        cert?: string;
        /**
         * The path to the client key.
         */
        key?: string;
        /**
         * Skip TLS verification.
         */
        skipTlsVerify?: boolean;
    };

    /**
     * The description of the context.
     */
    description?: string;

    /**
     * The name of the context to copy from.
     */
    from?: string;
}

/**
 * The arguments for a Docker context list command.
 */
export interface DockerContextListArgs extends SplatObject {
    /**
     * The format of the output.
     */
    format?: "table" | "json" | string;

    /**
     * Only display context names.
     */
    quiet?: boolean;

    /**
     * Show help information.
     */
    help?: boolean;
}

/**
 * The arguments for a Docker context inspect command.
 */
export interface DockerContextInspectArgs extends SplatObject {
    /**
     * The name of the contexts to inspect.
     */
    contexts: string[];

    /**
     * The format of the output.
     */
    format?: "json" | string;

    /**
     * Show help information.
     */
    help?: boolean;
}

/**
 * Splat a Docker context command.
 * @param subcommand The subcommand of `docker context`. For example, `ls`, `rm`, `use`, etc.
 * @param args The arguments for the command.
 * @returns The splatted array for the command.
 */
function splatContext(subcommand: string, args: SplatObject): string[] {
    return splat(args, {
        command: ["context", subcommand],
        argumentNames: ["context"],
    });
}

/**
 * Executes the `docker context list` command.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns The `DockerCommand`.
 */
export function list(args?: DockerContextListArgs, options?: CommandOptions): DockerCommand {
    if (!args) {
        return docker(["context", "ls"], options);
    }

    return docker(splatContext("ls", args), options);
}

/**
 * Executes the `docker context create` command.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns The `DockerCommand`.
 */
export function create(args: DockerCreateContextArgs, options?: CommandOptions): DockerCommand {
    if (args.help) {
        return docker(["context", "create", "--help"], options);
    }

    const a: string[] = ["context", "create", args.context];
    if (args.description) {
        a.push("--description", args.description);
    }

    if (args.from) {
        a.push("--from", args.from);
    }

    if (args.docker) {
        let str = "";
        const d = args.docker;
        if (d.host) {
            str += `host=${d.host}`;
        }

        if (d.ca) {
            str += `,ca=${d.ca}`;
        }

        if (d.cert) {
            str += `,cert=${d.cert}`;
        }

        if (d.key) {
            str += `,key=${d.key}`;
        }

        if (d.skipTlsVerify) {
            str += `,skip-tls-verify=${d.skipTlsVerify}`;
        }

        a.push("--docker", str);
    }

    return docker(a, options);
}

/**
 * Updates an existing Docker context with the `docker context update` command.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns The `DockerCommand`.
 */
export function update(args: DockerCreateContextArgs, options?: CommandOptions): DockerCommand {
    if (args.help) {
        return docker(["context", "update", "--help"], options);
    }

    const a: string[] = ["context", "create", args.context];
    if (args.description) {
        a.push("--description", args.description);
    }

    if (args.from) {
        a.push("--from", args.from);
    }

    if (args.docker) {
        let str = "";
        const d = args.docker;
        if (d.host) {
            str += `host=${d.host}`;
        }

        if (d.ca) {
            str += `,ca=${d.ca}`;
        }

        if (d.cert) {
            str += `,cert=${d.cert}`;
        }

        if (d.key) {
            str += `,key=${d.key}`;
        }

        if (d.skipTlsVerify) {
            str += `,skip-tls-verify=${d.skipTlsVerify}`;
        }

        a.push("--docker", str);
    }

    return docker(a, options);
}

/**
 * This function lists the names of all Docker contexts.
 * @returns A list of context names.
 */
export async function listNames(): Promise<string[]> {
    const res = await list({ quiet: true }).output();
    return res.lines().map((x) => x.trim()).filter((x) => x.length > 0);
}

/**
 * Removes a Docker context with the `docker context rm` command.
 * @param args The arguments for the command.
 * @returns The `DockerCommand`.
 */
export function rm(args: DockerRemoveContextArgs): DockerCommand {
    return docker(splatContext("rm", args));
}

/**
 * Uses a Docker context with the `docker context use` command.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns The `DockerCommand`.
 */
export function use(args: DockerContextArgs | string, options?: CommandOptions): DockerCommand {
    if (typeof args === "string") {
        return docker(["context", "use", name], options);
    }

    return docker(splatContext("use", args), options);
}

/**
 * Inspects a Docker context with the `docker context inspect` command.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns The `DockerCommand`.
 */
export function inspect(
    args: DockerContextInspectArgs | string,
    options?: CommandOptions,
): DockerCommand {
    if (typeof args === "string") {
        return docker(["context", "inspect", args], options);
    }

    if (args.help) {
        return docker(["context", "inspect", "--help"], options);
    }

    return docker(
        splat(args, {
            command: ["context", "inspect"],
            argumentNames: ["contexts"],
        }),
        options,
    );
}

/**
 * Shows the current Docker context with the `docker context show` command.
 * @param options The options for the command.
 * @returns The `DockerCommand`.
 */
export function show(options?: CommandOptions): DockerCommand {
    return docker(["context", "show"], options);
}

/**
 * Imports a Docker context with the `docker context import` command.
 * @param context The context name
 * @param file The file to import
 * @param options The options for the command.
 * @returns The `DockerCommand`.
 */
export function imports(context: string, file?: string, options?: CommandOptions): DockerCommand {
    const args = ["context", "import"];
    if (context) {
        args.push(context);
    }

    if (file) {
        args.push(file);
    }

    return docker(args, options);
}

/**
 * Exports a Docker context with the `docker context export` command.
 * @param context The context name
 * @param file The file to export
 * @param options The options for the command.
 * @returns The `DockerCommand`.
 */
export function exports(context: string, file?: string, options?: CommandOptions): DockerCommand {
    const args = ["context", "export"];
    if (context) {
        args.push(context);
    }

    if (file) {
        args.push(file);
    }

    return docker(args, options);
}
