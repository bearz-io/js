import { type CommandOptions, splat } from "@bearz/exec";
import { docker, type DockerCommand, type DockerGlobalArgs } from "../command.ts";

/**
 * The arguments for the Docker stack config command.
 */
export interface DockerStackConfigArgs extends DockerGlobalArgs {
    /**
     * The path to the one or more Compose files.
     */
    composeFile: string[];

    /**
     * Skip interpolation and output only merged configuration.
     */
    skipInterpolation?: boolean;
}

/**
 * Creates an executable DockerCommand that outputs the merged configuration.
 * @param args The arguments for the Docker stack config command.
 * @param options The options for the Docker stack config command.
 * @returns The `DockerCommand` that outputs the merged configuration.
 */
export function config(args: DockerStackConfigArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["stack", "config"],
            argumentNames: ["composeFile"],
            appendArguments: true,
        }),
        options,
    );
}

export interface DockerStackDeployArgs extends DockerGlobalArgs {
    /**
     * The path to the one or more Compose files.
     */
    composeFile: string[];

    /**
     * Exit immediately instead of waiting for the stack to converge. (default true)
     */
    detach?: boolean;

    /**
     * Prune services that are no longer referenced.
     */
    prune?: boolean;

    /**
     * Query the registry to resolve image digest and supported platforms.
     * ("always", "changed", "never").
     */
    resolveImage?: "always" | "changed" | "never";

    /**
     * Send registry authentication details to Swarm agents. (default false).
     */
    withRegistryAuth?: boolean;
}

/**
 * Creates an executable DockerCommand that deploys a Docker stack.
 * @param args The arguments for the Docker stack deploy command.
 * @param options The options for the Docker stack deploy command.
 * @returns `DockerCommand` that deploys a Docker stack.
 */
export function deploy(args: DockerStackDeployArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["stack", "deploy"],
            argumentNames: ["composeFile"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * Arguments for the Docker stack ls command.
 */
export interface DockerStackLsArgs extends DockerGlobalArgs {
    /**
     * Format the output using the given Go template.
     */
    format?: "json" | "table" | string;
}

/**
 * Creates an executable DockerCommand that lists Docker stacks.
 * @param args The arguments for the Docker stack ls command.
 * @param options The options for the Docker stack ls command.
 * @returns `DockerCommand` that lists Docker stacks.
 */
export function ls(args: DockerStackLsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["stack", "ls"],
        }),
        options,
    );
}

/**
 * The arguments for the Docker stack ps command.
 */
export interface DockerStackPsArgs extends DockerGlobalArgs {
    /**
     * The name of the stack.
     */
    stack: string;

    /**
     * Filter output based on conditions provided.
     */
    filter?: string;

    /**
     * Format the output using the given Go template.
     */
    format?: "json" | "table" | string;

    /**
     * Do not map IDs to Names
     */
    noResolve?: boolean;

    /**
     * Do not truncate output.
     */
    noTrunc?: boolean;

    /**
     * Only display task IDs.
     */
    quiet?: boolean;
}

export function ps(args: DockerStackPsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["stack", "ps"],
            argumentNames: ["stack"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker stack rm command.
 */
export interface DockerStackRmArgs extends DockerGlobalArgs {
    /**
     * The name of the stack.
     */
    stack: string[];

    /**
     * Do not wait for the stack to be removed.
     */
    detach?: boolean;
}

export function rm(args: DockerStackRmArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["stack", "rm"],
            argumentNames: ["stack"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker stack services command.
 */
export interface DockerStackServicesArgs extends DockerGlobalArgs {
    /**
     * The name of the stack.
     */
    stack: string;

    /**
     * Filter output based on conditions provided.
     */
    filter?: string;

    /**
     * Format the output using the given Go template.
     */
    format?: "json" | "table" | string;

    /**
     * Only display IDs.
     */
    quiet?: boolean;
}

export function services(args: DockerStackServicesArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["stack", "services"],
            argumentNames: ["stack"],
            appendArguments: true,
        }),
        options,
    );
}
