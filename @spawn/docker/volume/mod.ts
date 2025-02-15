import { type CommandOptions, splat } from "@bearz/exec";
import { docker, type DockerCommand, type DockerGlobalArgs } from "../command.ts";

/**
 * The arguments for the Docker volume create command.
 */
export interface DockerVolumeCreateArgs extends DockerGlobalArgs {
    /**
     * The name of the volume.
     */
    volume?: string;

    /**
     * Specify the volume driver name. (default "local").
     */
    driver?: string;

    /**
     * Set metadata for a volume.
     */
    label?: string[];

    /**
     * Set driver specific options. (default map[]).
     */
    opt?: string[];
}

/**
 * Creates an executable DockerCommand that creates a Docker volume.
 * @param args The arguments for the Docker volume create command.
 * @param options The options for the Docker volume create command.
 * @returns `DockerCommand` that creates a Docker volume.
 */
export function create(args: DockerVolumeCreateArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["volume", "create"],
            argumentNames: ["volume"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker volume inspect command.
 */
export interface DockerVolumeInspectArgs extends DockerGlobalArgs {
    /**
     * The name of the volume.
     */
    volume: string[];

    /**
     * Format the output using the given Go template.
     */
    format?: "json" | string;
}

/**
 * Creates an executable DockerCommand that inspects a Docker volume.
 * @param args The arguments for the Docker volume inspect command.
 * @param options The options for the Docker volume inspect command.
 * @returns `DockerCommand` that inspects a Docker volume.
 */
export function inspect(args: DockerVolumeInspectArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["volume", "inspect"],
            argumentNames: ["volume"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker volume ls command.
 */
export interface DockerVolumeLsArgs extends DockerGlobalArgs {
    /**
     * Provide filter values (e.g. "dangling=true").
     */
    filter?: string;

    /**
     * Format the output using the given Go template.
     */
    format?: "json" | "table" | string;

    /**
     * Only display volume names.
     */
    quiet?: boolean;
}

/**
 * Creates an executable DockerCommand that lists Docker volumes.
 * @param args The arguments for the Docker volume ls command.
 * @param options The options for the Docker volume ls command.
 * @returns `DockerCommand` that lists Docker volumes.
 */
export function ls(args: DockerVolumeLsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["volume", "ls"],
        }),
        options,
    );
}

/**
 * The arguments for the Docker volume prune command.
 */
export interface DockerVolumePruneArgs extends DockerGlobalArgs {
    /**
     * Remove all unused volumes, not just anonymous ones.
     */
    all?: boolean;

    /**
     * Provide filter values (e.g. "label=<label>").
     */
    filter?: string;

    /**
     * Do not prompt for confirmation.
     */
    force?: boolean;
}

/**
 * Creates an executable DockerCommand that prunes Docker volumes.
 * @param args The arguments for the Docker volume prune command.
 * @param options The options for the Docker volume prune command.
 * @returns `DockerCommand` that prunes Docker volumes.
 */
export function prune(args: DockerVolumePruneArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["volume", "prune"],
        }),
        options,
    );
}

/**
 * The arguments for the Docker volume rm command.
 */
export interface DockerVolumeRmArgs extends DockerGlobalArgs {
    /**
     * The name of the volume.
     */
    volume: string[];

    /**
     * Force the removal of one or more volumes.
     */
    force?: boolean;
}

/**
 * Creates an executable DockerCommand that removes Docker volumes.
 * @param args The arguments for the Docker volume rm command.
 * @param options The options for the Docker volume rm command.
 * @returns `DockerCommand` that removes Docker volumes.
 */
export function rm(args: DockerVolumeRmArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["volume", "rm"],
            argumentNames: ["volume"],
            appendArguments: true,
        }),
        options,
    );
}
