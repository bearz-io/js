import { type CommandOptions, splat } from "@bearz/exec";
import { docker, type DockerCommand, type DockerGlobalArgs } from "../command.ts";

/**
 * The arguments for the Docker node demote command.
 */
export interface DockerNodeDemoteArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the node(s) to demote.
     */
    node?: string[];
}

/**
 * Creates an executable DockerCommand that demotes a Docker node.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns `DockerCommand` that demotes a Docker node.
 */
export function demote(args: DockerNodeDemoteArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["node", "demote"],
            argumentNames: ["node"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker node inspect command.
 */
export interface DockerNodeInspectArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the node(s) to inspect.
     */
    node: string[];

    /**
     * Format the output using the given Go template.
     */
    format?: "json" | string;

    /**
     * Print the information in a human friendly format.
     */
    pretty?: boolean;
}

/**
 * Creates an executable DockerCommand that inspects a Docker node.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns `DockerCommand` that inspects a Docker node.
 */
export function inspect(args: DockerNodeInspectArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["node", "inspect"],
            argumentNames: ["node"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker node ls command.
 */
export interface DockerNodeLsArgs extends DockerGlobalArgs {
    /**
     * Filter output based on conditions provided.
     */
    filter?: string;

    /**
     * Format the output using the given Go template.
     */
    format?: string;

    /**
     * Only display IDs.
     */
    quiet?: boolean;
}

/**
 * Creates an executable DockerCommand that lists Docker nodes.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns `DockerCommand` that lists Docker nodes.
 */
export function ls(args: DockerNodeLsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["node", "ls"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker node promote command.
 */
export interface DockerNodePromoteArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the node(s) to promote.
     */
    node: string[];
}

/**
 * Creates an executable DockerCommand that promotes a Docker node to
 * a manager node in swarm.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns `DockerCommand` that promotes a Docker node.
 */
export function promote(args: DockerNodePromoteArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["node", "promote"],
            argumentNames: ["node"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker node ps command.
 */
export interface DockerNodePsArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the node.
     */
    node?: string[];

    /**
     * Filter output based on conditions provided.
     */
    filter?: string;

    /**
     * Format the output using the given Go template.
     */
    format?: string;

    /**
     * Do not map IDs to Names
     */
    noResolve?: boolean;

    /**
     * Do not truncate output
     */
    noTrunc?: boolean;

    /**
     * Only display IDs
     */
    quiet?: boolean;
}

/**
 * Creates an executable DockerCommand that lists tasks running on a node.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns `DockerCommand` that lists tasks running on a node.
 */
export function ps(args: DockerNodePsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["node", "ps"],
            argumentNames: ["node"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker node rm command.
 */
export interface DockerNodeRmArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the node(s) to remove.
     */
    node: string[];

    /**
     * Force remove a node from the swarm.
     */
    force?: boolean;
}

/**
 * Create an executable DockerCommand that removes a Docker node from the swarm.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns `DockerCommand` that removes a Docker node from the swarm.
 */
export function rm(args: DockerNodeRmArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["node", "rm"],
            argumentNames: ["node"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker node update command.
 */
export interface DockerNodeUpdateArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the node to update.
     */
    node: string;

    /**
     * Availability of the node ("active", "pause", or "drain").
     */
    availability?: "active" | "pause" | "drain";

    /**
     * Add or update node labels ("key=value").
     */
    labelAdd?: string[];

    /**
     * Remove a mode label if exists.
     */
    labelRm?: string[];

    /**
     * Role of the node ("manager" or "worker").
     */
    role?: "manager" | "worker";
}

/**
 * Creates an executable DockerCommand that updates a Docker node.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns `DockerCommand` that updates a Docker node.
 */
export function update(args: DockerNodeUpdateArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["node", "update"],
            argumentNames: ["node"],
            appendArguments: true,
        }),
        options,
    );
}
