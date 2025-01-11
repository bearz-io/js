/**
 * The config module represents the Docker config sub commands.
 *
 * @module
 */
import { type CommandOptions, splat } from "@bearz/exec";
import { docker, type DockerCommand, type DockerGlobalArgs } from "../command.ts";

/**
 * The arguments for the Docker config create command.
 */
export interface DockerConfigCreateArgs extends DockerGlobalArgs {
    /**
     * The name of the config.
     */
    config: string;

    /**
     * The file to read the config from. If not used, the config is read from stdin.
     */
    file?: string;

    /**
     * The labels to apply to the config.
     */
    label?: string[];

    /**
     * The template driver to use for the config.
     */
    templateDriver?: string;
}

export function create(args: DockerConfigCreateArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["config", "create"],
            argumentNames: ["config", "file"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker config inspect command.
 */
export interface DockerConfigInspectArgs extends Omit<DockerGlobalArgs, "config"> {
    /**
     * The name of the config.
     */
    config: string[];

    /**
     * Format the output using the given Go template.
     */
    format?: "json" | string;

    /**
     * Print the information in a human friendly format.
     */
    pretty?: boolean;
}

export function inspect(args: DockerConfigInspectArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["config", "inspect"],
            argumentNames: ["config"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker config ls command.
 */
export interface DockerConfigListArgs extends DockerGlobalArgs {
    /**
     * Filter output based on conditions provided
     */
    filter?: string;

    /**
     * Format the output using the given Go template.
     */
    format?: "json" | string;

    /**
     * Only display IDs.
     */
    quiet?: boolean;
}

/**
 * Creates an executable DockerCommand that lists Docker configs.
 * @param args The arguments for the Docker config ls command.
 * @param options The options for the Docker config ls command.
 * @returns `DockerCommand` that lists Docker configs.
 */
export function ls(args: DockerConfigListArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["config", "ls"],
            appendArguments: true,
        }),
        options,
    );
}

export interface DockerConfigRmArgs extends Omit<DockerGlobalArgs, "config"> {
    /**
     * The name of the config.
     */
    config: string[];
}

export function rm(args: DockerConfigRmArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["config", "rm"],
            argumentNames: ["config"],
            appendArguments: true,
        }),
        options,
    );
}
