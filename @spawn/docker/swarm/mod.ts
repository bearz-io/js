import { type CommandOptions, splat } from "@bearz/exec";
import { docker, type DockerCommand, type DockerGlobalArgs } from "../command.ts";

/**
 * The arguments for the Docker swarm init command.
 */
export interface DockerSwarmInitArgs extends DockerGlobalArgs {
    /**
     * Advertised address (format: "<ip|interface>[:port]").
     */
    advertiseAddr?: string;

    /**
     * Availability of the node ("active", "pause", "drain") (default "active").
     */
    availability?: "active" | "pause" | "drain";

    /**
     * Validity period for node certificates (ns|us|ms|s|m|h) (default 2160h0m0s).
     */
    certExpiry?: string;

    /**
     * Address or interface to use for data path traffic (format: "<ip|interface>").
     */
    dataPathAddr?: string;

    /**
     * Port number to use for data path traffic (1024 - 49151). If no value is set or is set to 0, the default port (4789) is used.
     */
    dataPathPort?: number;

    /**
     * default address pool in CIDR format (default []).
     */
    defaultAddrPool?: string[];

    /**
     * default address pool subnet mask length (default 24).
     */
    defaultAddrPoolMaskLength?: number;

    /**
     * Dispatcher heartbeat period (ns|us|ms|s|m|h) (default 5s).
     */
    dispatcherHeartbeat?: string;

    /**
     * Specifications of one or more certificate signing endpoints.
     */
    externalCa?: string[];

    /**
     * Force create a new cluster from current state.
     */
    forceNewCluster?: boolean;

    /**
     * Listen address (format: "<ip|interface>[:port]") (default).
     */
    listenAddr?: string;

    /**
     * Number of additional Raft snapshots to retain.
     */
    maxSnapshots?: number;

    /**
     * Number of log entries between Raft snapshots (default 10000).
     */
    snapshotInterval?: number;

    /**
     * Task history retention limit (default 5).
     */
    taskHistoryLimit?: number;
}

/**
 * Creates an executable DockerCommand that initializes a Docker swarm.
 * @param args The arguments for the Docker swarm init command.
 * @param options The options for the Docker swarm init command.
 * @returns `DockerCommand` that initializes a Docker swarm.
 */
export function init(args: DockerSwarmInitArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["swarm", "init"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker swarm join command.
 */
export interface DockerSwarmJoinArgs extends Omit<DockerGlobalArgs, "host"> {
    /**
     * HOST:PORT of the manager node to join.
     */
    host: string;

    /**
     * Advertised address (format: "<ip|interface>[:port]").
     */
    advertiseAddr?: string;

    /**
     * Availability of the node ("active", "pause", "drain") (default "active").
     */
    availability?: "active" | "pause" | "drain";

    /**
     * Address or interface to use for data path traffic (format: "<ip|interface>").
     */
    dataPathAddr?: string;

    /**
     * Listen address (format: "<ip|interface>[:port]") (default).
     */
    listenAddr?: string;

    /**
     * Token for joining the swarm.
     */
    token?: string;
}

/**
 * Creates an executable DockerCommand that joins a Docker swarm.
 * @param args The arguments for the Docker swarm join command.
 * @param options The options for the Docker swarm join command.
 * @returns `DockerCommand` that joins a Docker swarm.
 */
export function join(args: DockerSwarmJoinArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["swarm", "join"],
            argumentNames: ["host"],
            appendArguments: true,
        }),
        options,
    );
}
