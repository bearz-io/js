import { type CommandOptions, splat } from "@bearz/exec";
import { docker, type DockerCommand, type DockerGlobalArgs } from "../command.ts";

/**
 * The base arguments for Docker service commands.
 */
export interface DockerServiceBaseArgs extends Omit<DockerGlobalArgs, "config"> {
    /**
     * The Linux capabilities to add to the container.
     */
    capAdd?: string[];

    /**
     * The Linux capabilities to drop from the container.
     */
    capDrop?: string[];

    /**
     * The credential spec for the service.
     */
    credentialSpec?: string;

    /**
     * Detach from the service after creating it.
     */
    detach?: boolean;

    /**
     * The endpoint mode for the service. (vip or dnsrr. default "vip")
     */
    endpointMode?: "vip" | "dnsrr";

    /**
     * The entrypoint for the service.
     */
    entrypoint?: string;

    /**
     * The command to run to check health.
     */
    healthCmd?: string;

    /**
     * Time between running the check (ms|s|m|h).
     */
    healthInterval?: string;

    /**
     * Consecutive failures needed to report unhealthy.
     */
    healthRetries?: number;

    /**
     * Time between running the check during the start period (ms|s|m|h).
     */
    healthStartInterval?: string;

    /**
     * Start period for the container to initialize before counting retries towards unstable (ms|s|m|h).
     */
    healthStartPeriod?: string;

    /**
     * Maximum time to allow one check to run (ms|s|m|h).
     */
    healthTimeout?: string;

    /**
     * Container hostname.
     */
    hostname?: string;

    /**
     * Use an init inside each service container to forward signals and reap processes.
     */
    init?: boolean;

    /**
     * Service container isolation mode.
     */
    isolation?: string;

    /**
     * Limit CPUs.
     */
    limitCpu?: number;

    /**
     * Limit Memory.
     */
    limitMemory?: string;

    /**
     * Limit maximum number of processes (default 0 = unlimited).
     */
    limitPids?: number;

    /**
     * Logging driver for service.
     */
    logDriver?: string;

    /**
     * Logging driver options.
     */
    logOpt?: string[];

    /**
     * Number of job tasks to run concurrently (default equal to --replicas).
     */
    maxConcurrent?: number;

    /**
     * Service mode ("replicated", "global", "replicated-job", "global-job") (default "replicated").
     */
    mode?: "replicated" | "global" | "replicated-job" | "global-job";

    /**
     * Attach a filesystem mount to the service.
     */
    mount?: string[];

    /**
     * Network attachments.
     */
    network?: string[];

    /**
     * Disable any container-specified HEALTHCHECK.
     */
    noHealthcheck?: boolean;

    /**
     * Do not query the registry to resolve image digest and supported platforms.
     */
    noResolveImage?: boolean;

    /**
     * Tune host's OOM preferences (-1000 to 1000).
     */
    oomScoreAdj?: number;

    /**
     * Suppress progress output.
     */
    quiet?: boolean;

    /**
     * Mount the container's root filesystem as read only.
     */
    readOnly?: boolean;

    /**
     * Number of tasks.
     */
    replicas?: number;

    /**
     * Maximum number of tasks per node (default 0 = unlimited).
     */
    replicasMaxPerNode?: number;

    /**
     * Reserve CPUs.
     */
    reserveCpu?: number;

    /**
     * Reserve Memory.
     */
    reserveMemory?: string;

    /**
     * Restart when condition is met ("none", "on-failure", "any") (default "any").
     */
    restartCondition?: "none" | "on-failure" | "any";

    /**
     * Delay between restart attempts (ns|us|ms|s|m|h) (default 5s).
     */
    restartDelay?: string;

    /**
     * Maximum number of restarts before giving up.
     */
    restartMaxAttempts?: number;

    /**
     * Window used to evaluate the restart policy (ns|us|ms|s|m|h).
     */
    restartWindow?: string;

    /**
     * Delay between task rollbacks (ns|us|ms|s|m|h) (default 0s).
     */
    rollbackDelay?: string;

    /**
     * Action on rollback failure ("pause", "continue") (default "pause").
     */
    rollbackFailureAction?: "pause" | "continue";

    /**
     * Failure rate to tolerate during a rollback (default 0).
     */
    rollbackMaxFailureRatio?: number;

    /**
     * Duration after each task rollback to monitor for failure (ns|us|ms|s|m|h) (default 5s).
     */
    rollbackMonitor?: string;

    /**
     * Rollback order ("start-first", "stop-first") (default "stop-first").
     */
    rollbackOrder?: "start-first" | "stop-first";

    /**
     * Maximum number of tasks rolled back simultaneously (0 to roll back all at once) (default 1).
     */
    rollbackParallelism?: number;

    /**
     * Time to wait
     */
    stopGracePeriod?: string;

    /**
     * Signal to stop the container.
     */
    stopSignal?: string;

    /**
     * Allocate a pseudo-TTY.
     */
    tty?: boolean;

    /**
     * Delay between updates (ns|us|ms|s|m|h) (default 0s).
     */
    updateDelay?: string;

    /**
     * Action on update failure ("pause", "continue", "rollback") (default "pause").
     */
    updateFailureAction?: "pause" | "continue" | "rollback";

    /**
     * Failure rate to tolerate during an update (default 0).
     */
    updateMaxFailureRatio?: number;

    /**
     * Duration after each task update to monitor for failure (ns|us|ms|s|m|h) (default 5s).
     */
    updateMonitor?: string;

    /**
     * Update order ("start-first", "stop-first") (default "stop-first").
     */
    updateOrder?: "start-first" | "stop-first";

    /**
     * Maximum number of tasks updated simultaneously (0 to update all at once) (default 1).
     */
    updateParallelism?: number;

    /**
     * Username or UID (format: <name|uid>[:<group|gid>]).
     */
    user?: string;

    /**
     * Send registry authentication details to swarm agents.
     */
    withRegistryAuth?: boolean;

    /**
     * Working directory inside the container.
     */
    workdir?: string;
}

/**
 * The arguments for the Docker service create command.
 */
export interface DockerServiceCreateArgs extends DockerServiceBaseArgs {
    /**
     * The image to use for the service.
     */
    image: string;

    /**
     * The command to run in the service.
     */
    command?: string;

    /**
     * The arguments to pass to the command.
     */
    args?: string[];

    /**
     * Set one or more configuration files on a service
     */
    config?: string[];

    /**
     * The placement constraints for the service.
     */
    constraint?: string[];

    /**
     * The labels to apply to the container.
     */
    containerLabel?: string[];

    /**
     * Service name.
     */
    name?: string;

    /**
     * The DNS servers to use for the service.
     */
    dns?: string[];

    /**
     * The DNS options to use for the service.
     */
    dnsOption?: string[];

    /**
     * The DNS search domains to use for the service.
     */
    dnsSearch?: string[];

    /**
     * The environment variables to set for the service.
     */
    env?: string[];

    /**
     * The environment variables to set for the service from a file.
     */
    envFile?: string[];

    /**
     * User defined resources.
     */
    genericResource?: string[];

    /**
     * Set one or more supplementary user groups for the container.
     */
    group?: string[];

    /**
     * Set one or more custom host-to-IP mappings (host:ip).
     */
    host?: string[];

    /**
     * Service labels.
     */
    label?: string[];

    /**
     * Add a placement preference.
     */
    placementPref?: string[];

    /**
     * Publish a port as a node port.
     */
    publish?: string[];

    /**
     * Specify secrets
     */
    secret?: string[];

    /**
     * Sysctl options.
     */
    sysctl?: string[];

    /**
     * Ulimit options (default []).
     */
    ulimit?: string[];
}

export function create(args: DockerServiceCreateArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["service", "create"],
            argumentNames: ["image", "command", "args"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker service inspect command.
 */
export interface DockerServiceInspectArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the service.
     */
    service: string[];

    /**
     * Format the output using the given Go template.
     */
    format?: "json" | string;

    /**
     * Print the information in a human friendly format.
     */
    pretty?: boolean;
}

export function inspect(args: DockerServiceInspectArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["service", "inspect"],
            argumentNames: ["service"],
            appendArguments: true,
        }),
        options,
    );
}

export interface DockerServiceLogsArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the service or task.
     */
    service: string;

    /**
     * Show extra details provided to logs.
     */
    details?: boolean;

    /**
     * Follow log output.
     */
    follow?: boolean;

    /**
     * Do not map IDs to Names in output.
     */
    noResolve?: boolean;

    /**
     * Do not print task IDs in output.
     */
    noTaskIds?: boolean;

    /**
     * Do not truncate output.
     */
    noTrunc?: boolean;

    /**
     * Do not neatly format logs.
     */
    raw?: boolean;

    /**
     * Show logs since timestamp. (e.g. "2013-01-02T13:23:37") or
     * relative (e.g. "42m" for 42 minutes).
     */
    since?: string;

    /**
     * Number of lines to show from the end of the logs. (default "all").
     */
    tail?: string;

    /**
     * Show timestamps.
     */
    timestamps?: boolean;
}

/**
 * Creates an executable DockerCommand that shows logs for a Docker service.
 * @param args The arguments for the Docker service logs command.
 * @param options The options for the Docker service logs command.
 * @returns `DockerCommand` that shows logs for a Docker service.
 */
export function logs(args: DockerServiceLogsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["service", "logs"],
            argumentNames: ["service"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker service ls command.
 */
export interface DockerServiceLsArgs extends DockerGlobalArgs {
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

/**
 * Creates an executable DockerCommand that lists Docker services.
 * @param args The arguments for the Docker service ls command.
 * @param options The options for the Docker service ls command.
 * @returns `DockerCommand` that lists Docker services.
 */
export function ls(args: DockerServiceLsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["service", "ls"],
        }),
        options,
    );
}

/**
 * The arguments for the Docker service ps command.
 */
export interface DockerServicePsArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the service.
     */
    service: string[];

    /**
     * Filter output based on conditions provided.
     */
    filter?: string;

    /**
     * Format the output using the given Go template.
     */
    format?: "json" | string;

    /**
     * Do not map IDs to Names.
     */
    noResolve?: boolean;

    /**
     * Do not truncate output.
     */
    noTrunc?: boolean;

    /**
     * Only display task IDS.
     */
    quiet?: boolean;
}

/**
 * Creates an executable DockerCommand that lists tasks for a Docker service.
 * @param args The arguments for the Docker service ps command.
 * @param options The options for the Docker service ps command.
 * @returns `DockerCommand` that lists tasks for a Docker service.
 */
export function ps(args: DockerServicePsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["service", "ps"],
            argumentNames: ["service"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker service rm command.
 */
export interface DockerServiceRmArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the service.
     */
    service: string[];
}

/**
 * Creates an executable DockerCommand that removes Docker services.
 * @param args The arguments for the Docker service rm command.
 * @param options The options for the Docker service rm command.
 * @returns `DockerCommand` that removes Docker services.
 */
export function rm(args: DockerServiceRmArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["service", "rm"],
            argumentNames: ["service"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker service rollback command.
 */
export interface DockerServiceRollbackArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the service.
     */
    service: string;

    /**
     * Exit immediately instead of waiting for the service to converge.
     */
    detach?: boolean;

    /**
     * Suppress progress output.
     */
    quiet?: boolean;
}

/**
 * Creates an executable DockerCommand that rolls back a Docker service.
 * @param args The arguments for the Docker service rollback command.
 * @param options The options for the Docker service rollback command.
 * @returns `DockerCommand` that rolls back a Docker service.
 */
export function rollback(args: DockerServiceRollbackArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["service", "rollback"],
            argumentNames: ["service"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker service scale command.
 */
export interface DockerServiceScaleArgs extends DockerGlobalArgs {
    /**
     * SERVICE=REPLICAS.  The service and number of replicas to scale to.
     */
    service: string[];

    /**
     * Exit immediately instead of waiting for the service to converge.
     */
    detach?: boolean;
}

/**
 * Creates an executable DockerCommand that scales a Docker service.
 * @param args The arguments for the Docker service scale command.
 * @param options The options for the Docker service scale command.
 * @returns `DockerCommand` that scales a Docker service.
 */
export function scale(args: DockerServiceScaleArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["service", "scale"],
            argumentNames: ["service"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker service update command.
 */
export interface DockerServiceUpdateArgs extends DockerServiceBaseArgs {
    /**
     * The name or ID of the service.
     */
    service: string;

    /**
     * The command args.
     */
    args?: string[];

    /**
     * Add or update a config file on a service.
     */
    configAdd?: string[];

    /**
     * Remove a config file from a service.
     */
    configRemove?: string[];

    /**
     * Add or update a placement constraint on a service.
     */
    constraintAdd?: string[];

    /**
     * Remove a placement constraint from a service.
     */
    constraintRemove?: string[];

    /**
     * Add or update a container label on a service.
     */
    containerLabelAdd?: string[];

    /**
     * Remove a container label from a service by its key.
     */
    containerLabelRemove?: string[];

    /**
     * ADd or update a custom DNS server.
     */
    dnsAdd?: string[];

    /**
     * Add or update a custom DNS option.
     */
    dnsOptionAdd?: string[];

    /**
     * Remove a custom DNS option.
     */
    dnsOptionRm?: string[];

    /**
     * Remove a custom DNS server.
     */
    dnsRm?: string[];

    /**
     * Add or update a custom DNS search domain.
     */
    dnsSearchAdd?: string[];

    /**
     * Remove a custom DNS search domain.
     */
    dnsSearchRm?: string[];

    /**
     * Add or update an environment variable.
     */
    envAdd?: string[];

    /**
     * Remove an environment variable.
     */
    envRm?: string[];

    /**
     * Force update even if no changes require it.
     */
    force?: boolean;

    /**
     * Add a generic resource.
     */
    genericResourceAdd?: string[];

    /**
     * Remove a generic resource.
     */
    genericResourceRm?: string[];

    /**
     * Add an additional supplementary user group to the container.
     */
    groupAdd?: string[];

    /**
     * Remove a supplementary user group from the container.
     */
    groupRm?: string[];

    /**
     * Add a custom host-to-IP mapping ("host:ip").
     */
    hostAdd?: string[];

    /**
     * Remove a custom host-to-IP mapping ("host:ip").
     */
    hostRm?: string[];

    /**
     * Add or update a service label.
     */
    labelAdd?: string[];

    /**
     * Remove a service label by its key.
     */
    labelRm?: string[];

    /**
     * Add or update a mount on a service.
     */
    mountAdd?: string[];

    /**
     * Remove a mount by its target path.
     */
    mountRm?: string[];

    /**
     * Add a network.
     */
    networkAdd?: string[];

    /**
     * Remove a network.
     */
    networkRm?: string[];

    /**
     * ADd a placement preference.
     */
    placementPrefAdd?: string[];

    /**
     * Remove a placement preference.
     */
    placementPrefRm?: string[];

    /**
     * Add or update a published port.
     */
    publishAdd?: string[];

    /**
     * Remove a published port.
     */
    publishRm?: string[];

    /**
     * Add or update a secret on a service.
     */
    secretAdd?: string[];

    /**
     * Remove a secret.
     */
    secretRm?: string[];

    /**
     * ADd or update a Sysctl option.
     */
    sysctlAdd?: string[];

    /**
     * Remove a Sysctl option.
     */
    sysctlRm?: string[];

    /**
     * Add or update a ulimit option (default []).
     */
    ulimitAdd?: string[];

    /**
     * Remove a ulimit option.
     */
    ulimitRm?: string[];
}

export function update(args: DockerServiceUpdateArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["service", "update"],
            argumentNames: ["service"],
            appendArguments: true,
        }),
        options,
    );
}
