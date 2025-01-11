import { type CommandOptions, splat } from "@bearz/exec";
import { docker, type DockerCommand, type DockerGlobalArgs } from "../command.ts";

/**
 * The arguments for the Docker network connect command.
 */
export interface DockerNetworkConnectArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the network
     */
    network: string;

    /**
     * The name or ID of the container
     */
    container: string;

    /**
     * Add network-scoped alias for the container.
     */
    alias?: string[];

    /**
     * Driver options for the network in the form key=value.
     */
    driverOpt?: string[];

    /**
     * IPv4 address to assign to the container. e.g. 172.30.100.104
     */
    ip?: string;

    /**
     * IPv6 address to assign to the container. e.g. 2001:db8::33
     */
    ip6?: string;

    /**
     * Add link to another container
     */
    link?: string[];

    /**
     * Add a link-local IPv6 address to the container
     */
    linkLocalIps?: string[];
}

/**
 * Creates an executable DockerCommand that connects a container to a Docker network.
 * @param args The arguments for the Docker network connect command.
 * @param options The options for the command.
 * @returns `DockerCommand` that connects a container to a Docker network.
 */
export function connect(args: DockerNetworkConnectArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["network", "connect"],
            argumentNames: ["network", "container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker network create command.
 */
export interface DockerNetworkCreateArgs extends DockerGlobalArgs {
    /**
     * The name of the network
     */
    network: string;

    /**
     * Enable manual container attachment
     */
    attachable?: boolean;

    /**
     * Auxiliary IPv4 or IPv6 addresses used by Network driver.
     */
    auxAddress?: string[];

    /**
     * The network from which to copy the configuration.
     */
    configFrom?: string;

    /**
     * Create a configuration only network.
     */
    configOnly?: boolean;

    /**
     * Driver to manage the Network.
     */
    driver?: string;

    /**
     * IPv4 or IPv6 Gateway for the master subnet.
     */
    gateway?: string[];

    /**
     * Create swarm routing-mesh network.
     */
    ingress?: boolean;

    /**
     * Restrict external access to the network.
     */
    internal?: boolean;

    /**
     * Allocate container ip from a sub-range.
     */
    ipRange?: string[];

    /**
     * IP Address Management Driver.
     */
    ipamDriver?: string;

    /**
     * Set IPAM driver specific options.
     */
    ipamOpt?: string[];

    /**
     * Enable or disable IPv6 networking.
     */
    ipv6?: boolean;

    /**
     * Set metadata on a network.
     */
    label?: string[];

    /**
     * Set driver specific options.
     */
    opt?: string[];

    /**
     * Control the network's scope.
     */
    scope?: string;

    /**
     * Subnet in CIDR format that represents a network segment.
     */
    subnet?: string[];
}

/**
 * Creates an executable DockerCommand that creates a Docker network.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns
 */
export function create(args: DockerNetworkCreateArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["network", "create"],
            argumentNames: ["network"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker network disconnect command.
 */
export interface DockerNetworkDisconnectArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the network.
     */
    network: string;

    /**
     * The name or ID of the container.
     */
    container: string;

    /**
     * Force the container to disconnect from the network.
     */
    force?: boolean;
}

/**
 * Creates an executable DockerCommand that disconnects a container from a Docker network.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns `DockerCommand` that disconnects a container from a Docker network.
 */
export function disconnect(
    args: DockerNetworkDisconnectArgs,
    options?: CommandOptions,
): DockerCommand {
    return docker(
        splat(args, {
            command: ["network", "disconnect"],
            argumentNames: ["network", "container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker network inspect command.
 */
export interface DockerNetworkInspectArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the network.
     */
    network: string[];

    /**
     * Format the output using the given Go template.
     */
    format?: "json" | string;

    /**
     * Verbose output for diagnostics.
     */
    verbose?: boolean;
}

/**
 * Creates an executable DockerCommand that inspects a Docker network.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns `DockerCommand` that inspects a Docker network.
 */
export function inspect(args: DockerNetworkInspectArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["network", "inspect"],
            argumentNames: ["network"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * Arguments for the Docker network ls command.
 */
export interface DockerNetworkLsArgs extends DockerGlobalArgs {
    /**
     * Provide filter values (e.g. "driver=bridge").
     */
    filter?: string;

    /**
     * Format the output using the given Go template.
     */
    format?: "json" | "table" | string;

    /**
     * Do not truncate output.
     */
    noTrunc?: boolean;

    /**
     * Only display network IDs.
     */
    quiet?: boolean;
}

/**
 * Creates an executable DockerCommand that lists Docker networks.
 * @param args The arguments for the Docker network ls command.
 * @param options The options for the Docker network ls command.
 * @returns `DockerCommand` that lists Docker networks.
 */
export function ls(args: DockerNetworkLsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["network", "ls"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * Arguments for the Docker network ls command.
 */
export interface DockerNetworkPruneArgs extends DockerGlobalArgs {
    /**
     * Provide filter values (e.g. "until=24h").
     */
    filter?: string;

    /**
     * Do not prompt for confirmation.
     */
    force?: boolean;
}

/**
 * Creates an executable DockerCommand that prunes Docker networks.
 * @param args The arguments for the Docker network prune command.
 * @param options The options for the Docker network prune command.
 * @returns `DockerCommand` that prunes Docker networks.
 */
export function prune(args: DockerNetworkPruneArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["network", "prune"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * Arguments for the Docker network rm command.
 */
export interface DockerNetworkRmArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the network.
     */
    network: string[];

    /**
     * Force the removal of one or more networks.
     */
    force?: boolean;
}

/**
 * Creates an executable DockerCommand that removes Docker networks.
 * @param args The arguments for the Docker network rm command.
 * @param options The options for the Docker network rm command.
 * @returns `DockerCommand` that removes Docker networks.
 */
export function rm(args: DockerNetworkRmArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["network", "rm"],
            argumentNames: ["network"],
            appendArguments: true,
        }),
        options,
    );
}
