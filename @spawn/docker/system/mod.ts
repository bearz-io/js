import { type CommandOptions, splat } from "@bearz/exec";
import { docker, type DockerCommand, type DockerGlobalArgs } from "../command.ts";

/**
 * Args for the Docker system df command.
 */
export interface DockerSystemDfArgs extends DockerGlobalArgs {
    /**
     * Format the output using the given Go template.
     */
    format?: "json" | "template" | string;

    /**
     * Show detailed information on space usage.
     */
    verbose?: boolean;
}

/**
 * Creates an executable DockerCommand that shows Docker disk usage.
 * @param args The arguments for the Docker system df command.
 * @param options The options for the Docker system df command.
 * @returns `DockerCommand` that shows Docker disk usage.
 */
export function df(args: DockerSystemDfArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["system", "df"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * Args for the Docker system event command.
 */
export interface DockerSystemEventsArgs extends DockerGlobalArgs {
    /**
     * Filter output based on conditions provided.
     */
    filter?: string;

    /**
     * Format the output using the given Go template.
     */
    format?: "json" | string;

    /**
     * Show all events from the specified timestamp (ns|us|ms|s|m|h) ago.
     */
    since?: string;

    /**
     * Stream events until this timestamp.
     */
    until?: string;
}

/**
 * Creates an executable DockerCommand that shows Docker events.
 * @param args The arguments for the Docker system event command.
 * @param options The options for the Docker system event command.
 * @returns `DockerCommand` that shows Docker events.
 */
export function events(args: DockerSystemEventsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["system", "events"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * Args for the Docker system info command.
 */
export interface DockerSystemInfoArgs extends DockerGlobalArgs {
    /**
     * Format the output using the given Go template.
     */
    format?: "json" | string;
}

/**
 * Creates an executable DockerCommand that shows Docker system information.
 * @param args The arguments for the Docker system info command.
 * @param options The options for the Docker system info command.
 * @returns `DockerCommand` that shows Docker system information.
 */
export function info(args: DockerSystemInfoArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["system", "info"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * Args for the Docker system prune command.
 */
export interface DockerSystemPruneArgs extends DockerGlobalArgs {
    /**
     * Remove all unused images not just dangling ones.
     */
    all?: boolean;

    /**
     * Provide filter values (e.g. "label=<key>=<value>").
     */
    filter?: string;

    /**
     * Do not prompt for confirmation.
     */
    force?: boolean;

    /**
     * Prune anonymous volumes.
     */
    volumes?: boolean;
}

/**
 * Creates an executable DockerCommand that prunes Docker system resources.
 * @param args The arguments for the Docker system prune command.
 * @param options The options for the Docker system prune command.
 * @returns `DockerCommand` that prunes Docker system resources.
 */
export function prune(args: DockerSystemPruneArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["system", "prune"],
            appendArguments: true,
        }),
        options,
    );
}
