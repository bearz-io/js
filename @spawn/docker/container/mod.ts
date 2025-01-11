/**
 * The container module represents the `docker container` sub commands.
 *
 * @module
 */
import { type CommandOptions, splat } from "@bearz/exec";
import { docker, type DockerCommand, type DockerGlobalArgs } from "../command.ts";

/**
 * The arguments for a Docker attach command.
 */
export interface DockerContainerAttachArgs extends DockerGlobalArgs {
    /**
     * The ID of the container to attach to.
     */
    container: string;

    /**
     * Override the key sequence for detaching a container.
     */
    detachKeys?: string;

    /**
     * Do not attach STDIN
     */
    noStdin?: boolean;

    /**
     * Proxy all received signals to the process (default: true)
     */
    sigProxy?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker attach` which attaches
 * local standard input, output, and error streams to a running container.
 * @param args The arguments for the Docker attach command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function attach(args: DockerContainerAttachArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["attach"],
            argumentNames: ["container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker commit command.
 */
export interface DockerContainerCommitArgs extends DockerGlobalArgs {
    /**
     * The ID of the container to commit.
     */
    container: string;
    /**
     * Repository name for the new image. [name[:tag]]
     */
    repository?: string;

    /**
     * Author (e.g., "John Hannibal Smith <hannibal@a-team.com>")
     */
    author?: string;

    /**
     * Change a Dockerfile instruction in the created image.
     */
    change?: string[];

    /**
     * Commit message for the new image.
     */
    message?: string;

    /**
     * Pause the container during commit (default: true)
     */
    pause?: boolean;
}

/**
 * @param args The arguments for the Docker commit command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function commit(args: DockerContainerCommitArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "commit"],
            argumentNames: ["container", "repository"],
            appendArguments: true,
        }),
        options,
    );
}

export interface DockerContainerCpArgs extends DockerGlobalArgs {
    /**
     * The source path. If source is a container then its
     *  CONTAINER:SRC_PATH
     */
    source: string;
    /**
     * The destination path. If destination is a container then its
     * CONTAINER:DEST_PATH
     */
    destination: string;

    /**
     * Archive mode (copy all uid/gid information)
     */
    archive?: boolean;

    /**
     * Always follow symbol link in SRC_PATH
     */
    followLink?: boolean;

    /**
     * Suppress progress output during copy. Progress
     * output is automatically suppressed if no terminal
     * is attached
     */
    quiet?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker cp`
 * which copies files/folders between a container and the local filesystem.
 * @param args The arguments for the Docker cp command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function cp(args: DockerContainerCpArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["cp"],
            argumentNames: ["source", "destination"],
            appendArguments: true,
        }),
        options,
    );
}

export interface DockerContainerCreateBaseArgs extends DockerGlobalArgs {
    /**
     * The image to run.
     */
    image: string;

    /**
     * The command to run in the container.
     */
    command?: string;

    /**
     * The arguments to pass to the command.
     */
    args?: string[];

    /**
     * Add a custom host-to-IP mapping (host:ip).
     */
    addHost?: string[];

    /**
     * Add an annotation to the container (passed through to the OCI runtime).
     */
    annotation?: Record<string, string>;

    /**
     * Attach to STDIN, STDOUT or STDERR.
     */
    attach?: string[];

    /**
     * Block IO (relative weight), between 10 and 1000, or 0 to disable.
     */
    blkioWeight?: number;

    /**
     * Block IO weight (relative device weight).
     */
    blkioWeightDevice?: string[];

    /**
     * Add Linux capabilities.
     */
    capAdd?: string[];

    /**
     * Drop Linux capabilities.
     */
    capDrop?: string[];

    /**
     * Optional parent cgroup for the container.
     */
    cgroupParent?: string;

    /**
     * Cgroup namespace to use.
     */
    cgroupns?: "host" | "private";

    /**
     * Write the container ID to the file.
     */
    cidfile?: string;

    /**
     * Limit CPU CFS (Completely Fair Scheduler) period.
     */
    cpuPeriod?: number;

    /**
     * Limit CPU CFS (Completely Fair Scheduler) quota.
     */
    cpuQuota?: number;

    /**
     * Limit CPU real-time period in microseconds.
     */
    cpuRtPeriod?: number;

    /**
     * Limit CPU real-time runtime in microseconds.
     */
    cpuRtRuntime?: number;

    /**
     * CPU shares (relative weight).
     */
    cpuShares?: number;

    /**
     * Number of CPUs.
     */
    cpus?: number;

    /**
     * CPUs in which to allow execution (0-3, 0,1).
     */
    cpusetCpus?: string;

    /**
     * MEMs in which to allow execution (0-3, 0,1).
     */
    cpusetMems?: string;

    /**
     * Add a host device to the container.
     */
    device?: string[];

    /**
     * Add a rule to the cgroup allowed devices list.
     */
    deviceCgroupRule?: string[];

    /**
     * Limit read rate (bytes per second) from a device.
     */
    deviceReadBps?: string[];

    /**
     * Limit read rate (IO per second) from a device.
     */
    deviceReadIops?: string[];

    /**
     * Limit write rate (bytes per second) to a device.
     */
    deviceWriteBps?: string[];

    /**
     * Limit write rate (IO per second) to a device.
     */
    deviceWriteIops?: string[];

    /**
     * Set custom DNS servers.
     */
    dns?: string[];

    /**
     * Set DNS options.
     */
    dnsOption?: string[];

    /**
     * Set custom DNS search domains.
     */
    dnsSearch?: string[];

    /**
     * Container NIS domain name.
     */
    domainname?: string;

    /**
     * Overwrite the default ENTRYPOINT of the image.
     */
    entrypoint?: string;

    /**
     * Set environment variables.
     */
    env?: string[];

    /**
     * Read in a file of environment variables.
     */
    envFile?: string[];

    /**
     * Expose a port or a range of ports.
     */
    expose?: string[];

    /**
     * GPU devices to add to the container ('all' to pass all GPUs).
     */
    gpus?: string;

    /**
     * Add additional groups to join.
     */
    groupAdd?: string[];

    /**
     * Command to run to check health.
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
     * Start period for the container to initialize before starting health-retries countdown (ms|s|m|h).
     */
    healthStartPeriod?: string;

    /**
     * Maximum time to allow one check to run (ms|s|m|h).
     */
    healthTimeout?: string;

    /**
     * Container host name.
     */
    hostname?: string;

    /**
     * Run an init inside the container that forwards signals and reaps processes.
     */
    init?: boolean;

    /**
     * Keep STDIN open even if not attached.
     */
    interactive?: boolean;

    /**
     * IPv4 address (e.g., 172.30.100.104).
     */
    ip?: string;

    /**
     * IPv6 address (e.g., 2001:db8::33).
     */
    ip6?: string;

    /**
     * IPC mode to use.
     */
    ipc?: string;

    /**
     * Container isolation technology.
     */
    isolation?: string;

    /**
     * Kernel memory limit.
     */
    kernelMemory?: string;

    /**
     * Set meta data on a container.
     */
    label?: string[];

    /**
     * Read in a line delimited file of labels.
     */
    labelFile?: string[];

    /**
     * Add link to another container.
     */
    link?: string[];

    /**
     * Container IPv4/IPv6 link-local addresses.
     */
    linkLocalIp?: string[];

    /**
     * Logging driver for the container.
     */
    logDriver?: string;

    /**
     * Log driver options.
     */
    logOpt?: string[];

    /**
     * Container MAC address (e.g., 92:d0:c6:0a:29:33).
     */
    macAddress?: string;

    /**
     * Memory limit.
     */
    memory?: string;

    /**
     * Memory soft limit.
     */
    memoryReservation?: string;

    /**
     * Swap limit equal to memory plus swap: '-1' to enable unlimited swap.
     */
    memorySwap?: string;

    /**
     * Tune container memory swappiness (0 to 100) (default -1).
     */
    memorySwappiness?: number;

    /**
     * Mount options.
     */
    mount?: string[];

    /**
     * Container name.
     */
    name?: string;

    /**
     * Network mode to use.
     */
    network?: string;

    /**
     * Network aliases.
     */
    networkAlias?: string[];

    /**
     * Disable healthcheck.
     */
    noHealthcheck?: boolean;

    /**
     * Disable OOM Killer.
     */
    oomKillDisable?: boolean;

    /**
     * Adjust OOM score.
     */
    oomScoreAdj?: number;

    /**
     * PID namespace to use.
     */
    pid?: string;

    /**
     * Tune container pids limit.
     */
    pidsLimit?: number;

    /**
     * Platform to use.
     */
    platform?: string;

    /**
     * Give extended privileges to this container.
     */
    privileged?: boolean;

    /**
     * Publish a container's port(s) to the host.
     */
    publish?: string[];

    /**
     * Publish all exposed ports to random ports.
     */
    publishAll?: boolean;

    /**
     * Pull image before running ("always", "missing", "never").
     */
    pull?: "always" | "missing" | "never";

    /**
     * Suppress verbose output.
     */
    quiet?: boolean;

    /**
     * Mount the container's root filesystem as read only.
     */
    readOnly?: boolean;

    /**
     * Restart policy to apply when a container exits.
     */
    restart?: string;

    /**
     * Automatically remove the container when it exits.
     */
    rm?: boolean;

    /**
     * Runtime to use for this container.
     */
    runtime?: string;

    /**
     * Security options.
     */
    securityOpt?: string[];

    /**
     * Size of /dev/shm.
     */
    shmSize?: string;

    /**
     * Signal to stop a container.
     */
    stopSignal?: string;

    /**
     * Timeout (in seconds) to stop a container.
     */
    stopTimeout?: number;

    /**
     * Storage driver options for the container.
     */
    storageOpt?: string[];

    /**
     * Sysctl options.
     */
    sysctl?: Record<string, string>;

    /**
     * Mount a tmpfs directory.
     */
    tmpfs?: string[];

    /**
     * Allocate a pseudo-TTY.
     */
    tty?: boolean;

    /**
     * Ulimit options.
     */
    ulimit?: string[];

    /**
     * Username or UID.
     */
    user?: string;

    /**
     * User namespace to use.
     */
    userns?: string;

    /**
     * UTS namespace to use.
     */
    uts?: string;

    /**
     * Bind mount a volume.
     */
    volume?: string[];

    /**
     * Optional volume driver for the container.
     */
    volumeDriver?: string;

    /**
     * Mount volumes from the specified container(s).
     */
    volumesFrom?: string[];

    /**
     * Working directory inside the container.
     */
    workdir?: string;
}

/**
 * Interface representing the arguments for running a Docker container.
 * Extends DockerGlobalArgs.
 */
export interface DockerCreateArgs extends DockerGlobalArgs {
    /**
     * Skip image verification (default true)
     */
    disableContentTrust?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker create` which creates a new container from an image.
 * @param args The arguments for the Docker create command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function create(
    args: DockerContainerCreateBaseArgs & DockerCreateArgs,
    options?: CommandOptions,
): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "create"],
            argumentNames: ["image", "command", "args"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker diff command.
 */
export interface DockerContainerDiffArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container to diff.
     */
    container: string;
}

/**
 * Creates an executable `DockerCommand` for `docker diff` which
 * inspects changes to files or directories on a container's filesystem.
 * @param args The arguments for the Docker diff command. If the args
 * is a string then its treated as the container name or ID.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function diff(
    args: DockerContainerDiffArgs | string,
    options?: CommandOptions,
): DockerCommand {
    if (typeof args === "string") {
        return docker(["container", "diff", args], options);
    }

    return docker(
        splat(args, {
            command: ["container", "diff"],
            argumentNames: ["container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker exec command.
 */
export interface DockerContainerExecArgs extends DockerGlobalArgs {
    /**
     * The ID of the container to execute the command in.
     */
    container: string;

    /**
     * The command to execute.
     */
    command: string[];

    /**
     * The environment variables to set for the command.
     */
    env?: Record<string, string>;

    /**
     * Read in a file of environment variables/
     */
    envFile?: string[];

    /**
     * Keep STDIN open even if not attached
     */
    interactive?: boolean;

    /**
     * Allocate a pseudo-TTY
     */
    tty?: boolean;

    /**
     * Username or UID (format: "<name|uid>[:<group|gid>]")
     */
    user?: string;

    /**
     * Working directory inside the container
     */
    workDir?: string;
}

/**
 * Creates an executable `DockerCommand` for `docker exec`.
 * @param args The arguments for the Docker exec command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function exec(args: DockerContainerExecArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "exec"],
            argumentNames: ["container", "command"],
        }),
        options,
    );
}

/**
 * The arguments for a Docker exec command.
 */
export interface DockerContainerExportArgs extends DockerGlobalArgs {
    /**
     * The ID of the container to execute the command in.
     */
    container: string;

    /**
     * Write to a file, instead of STDOUT
     */
    output?: string;
}

/**
 * Creates an executable `DockerCommand` for `docker export`.
 * which exports the container.
 *
 * @description
 * Uses exports rather than export due to the name conflict with the commonjs export
 * keyword.
 * @param args The arguments for the Docker exec command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function exports(args: DockerContainerExportArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["exec"],
            argumentNames: ["container", "command"],
        }),
        options,
    );
}

/**
 * The arguments for a Docker inspect command.
 */
export interface DockerContainerInspectArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container, image, volume, or network to inspect.
     */
    nameOrId: string[];
    /**
     * Format the output using the given Go template or json.
     */
    format?: "json" | string;
    /**
     * Display total file sizes if the type is container
     */
    size?: boolean;
    /**
     * Return JSON for the specified type
     */
    type?: string;
}

/**
 * Creates an executable `DockerCommand` for `docker inspect` which returns
 * a low-level information on Docker objects.
 * @param args The arguments for the Docker inspect command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function inspect(args: DockerContainerInspectArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "inspect"],
            argumentNames: ["nameOrId"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker kill command.
 */
export interface DockerContainerKillArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container..
     */
    container: string[];

    /**
     * The signal to send to the container, SIGKILL by default.
     */
    signal?: string;
}

/**
 * Creates an executable `DockerCommand` for `docker kill` which
 * kills one or more running containers.
 * @param args The arguments for the Docker inspect command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function kill(args: DockerContainerKillArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "kill"],
            argumentNames: ["container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker logs command.
 */
export interface DockerContainerLogsArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container to fetch logs from.
     */
    container: string;

    /**
     * Show extra details provided to logs.
     */
    details?: boolean;

    /**
     * Follow log output.
     */
    follow?: boolean;

    /**
     * Show logs since timestamp (e.g. "2013-01-02T13:23:37Z") or relative (e.g. "42m" for 42 minutes)
     */
    since?: string;

    /**
     * Show only the latest N lines of output.
     */
    tail?: number | string;

    /**
     * Show timestamps.
     */
    timestamps?: boolean;

    /**
     * Show logs before a timestamp (e.g. "2013-01-02T13:23:37Z") or relative (e.g. "42m" for 42 minutes)
     */
    until?: string;
}

/**
 * Creates an executable `DockerCommand` for `docker logs` which fetches logs from a container.
 * @param args The arguments for the Docker logs command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function logs(args: DockerContainerLogsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "logs"],
            argumentNames: ["container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker ps command.
 */
export interface DockerContainerLsArgs extends DockerGlobalArgs {
    /**
     * Show all containers (default shows just running)
     */
    all?: boolean;
    /**
     * Show extra information on containers
     */
    filter?: string[];
    /**
     * Format the output using a custom template: 'table', 'json' or a Go template
     */
    format?: "table" | "json" | string;
    /**
     * Show n last created containers (includes all states)
     */
    last?: number;
    /**
     * Show the latest created container (includes all states)
     */
    latest?: boolean;
    /**
     * Don't truncate output
     */
    noTrunc?: boolean;
    /**
     * Only display numeric IDs
     */
    quiet?: boolean;
    /**
     * Display total file sizes
     */
    size?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker container ls` which lists all running containers.
 * @param args The arguments for the Docker ps command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function ls(args: DockerContainerLsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "ls"],
            argumentNames: [],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker pause command.
 */
export interface DockerContainerPauseArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container(s) to pause.
     */
    containers: string[];
}

/**
 * Creates an executable `DockerCommand` for `docker pause` which pauses one or more running containers.
 * @param args The arguments for the Docker pause command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function pause(
    args: DockerContainerPauseArgs | string[],
    options?: CommandOptions,
): DockerCommand {
    if (Array.isArray(args)) {
        args = { containers: args } as DockerContainerPauseArgs;
    }

    return docker(
        splat(args as DockerContainerPauseArgs, {
            command: ["container", "pause"],
            argumentNames: ["containers"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker port command.
 */
export interface DockerContainerPortArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container.
     */
    container: string;

    /**
     * The private port number to lookup. [PRIVATE_PORT[/PROTOCOL]]
     */
    privatePort?: number;
}

/**
 * Creates an executable `DockerCommand` for `docker port` which lists port mappings for the specified container.
 * @param args The arguments for the Docker port command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function port(args: DockerContainerPortArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "port"],
            argumentNames: ["container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker prune command.
 */
export interface DockerContainerPruneArgs extends DockerGlobalArgs {
    /**
     * Provide filter values (e.g. "until=<timestamp>")
     */
    filter?: string;

    /**
     * Do not prompt for confirmation.
     */
    force?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker prune` which
 * removes all stopped containers
 * @param args The arguments for the Docker prune command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function prune(args: DockerContainerPruneArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "prune"],
        }),
        options,
    );
}

/**
 * The arguments for a Docker rename command.
 */
export interface DockerContainerRenameArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container.
     */
    container: string;

    /**
     * The new name for the container.
     */
    newName: string;
}

/**
 * Creates an executable `DockerCommand` for `docker rename` which renames a container.
 * @param args The arguments for the Docker rename command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function rename(args: DockerContainerRenameArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "rename"],
            argumentNames: ["container", "newName"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker rename command.
 */
export interface DockerContainerRestartArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container.
     */
    container: string[];

    /**
     * Signal to send to the container
     */
    signal?: string;

    /**
     * Seconds to wait before killing the container.
     */
    time?: number;
}

/**
 * Creates an executable `DockerCommand` for `docker restart` which
 * restarts one or more containers.
 * @param args The arguments for the Docker rename command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function restart(args: DockerContainerRestartArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "restart"],
            argumentNames: ["container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker rename command.
 */
export interface DockerContainerRemoveArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container.
     */
    container: string[];

    /**
     * For the removal of a running container (uses SIGKILL)
     */
    force?: boolean;

    /**
     * Remove the specified link
     */
    link?: boolean;

    /**
     * Remove anonymous volumes associaated with the container
     */
    volumes?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker rename` which
 * removes one or more containers.
 * @param args The arguments for the Docker rename command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function rm(args: DockerContainerRemoveArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "rm"],
            argumentNames: ["container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * Interface representing the arguments for running a Docker container.
 * Extends DockerGlobalArgs.
 */
export interface DockerContainerRunArgs extends DockerCreateArgs {
    /**
     * Run container in background and print container ID.
     */
    detach?: boolean;

    /**
     * Override the key sequence for detaching a container.
     */
    detachKeys?: string;

    /**
     * Proxy received signals to the process.
     */
    sigProxy?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker run` create and run
 * a new container from an image.
 * @param args The arguments for the Docker run command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function run(args: DockerContainerRunArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["exec"],
            argumentNames: ["image", "command", "args"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker start command.
 */
export interface DockerContainerStartArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container.
     */
    container: string[];

    /**
     * Attach STDOUT/STDERR and forward signals
     */
    attach?: boolean;

    /**
     * Override the key sequence for detaching a container
     */
    detachKeys?: string;

    /**
     * Attach container's STDIN
     */
    interactive?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker start` which starts
 * one or more stopped containers.
 * @param args The arguments for the Docker start command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function start(args: DockerContainerStartArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "start"],
            argumentNames: ["container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker start command.
 */
export interface DockerContainerStatArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container.
     */
    container?: string[];

    /**
     * Shows all containers. (default shows just running).
     */
    all?: boolean;

    /**
     * Format output as json, table, or using a custom template.
     */
    format?: "table" | "json" | string;

    /**
     * Disable streaming stats and only pull the first result
     */
    noStream?: boolean;

    /**
     * Do not truncate output
     */
    noTrunc?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker stat` which
 * displays a live stream of container(s) resource usage statistics
 * @param args The arguments for the Docker start command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function stat(args: DockerContainerStatArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "start"],
            argumentNames: ["container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker stop command.
 */
export interface DockerContainerStopArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container.
     */
    container: string[];

    ps?: string[];
}

/**
 * Creates an executable `DockerCommand` for `docker stop` which stops one or more
 * running containers.
 * @param args The arguments for the Docker stop command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function stop(args: DockerContainerStopArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "stop"],
            argumentNames: ["container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker top command.
 */
export interface DockerContainerTopArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container.
     */
    container: string;

    /**
     * [ps OPTIONS]
     */
    ps?: string[];
}

/**
 * Creates an executable `DockerCommand` for `docker top` displays the
 * running processes of a container
 * @param args The arguments for the Docker stop command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function top(args: DockerContainerTopArgs, options?: CommandOptions): DockerCommand {
    const { ps } = args;

    if (ps) {
        delete args["ps"];
    }

    const splatted = splat(args, {
        command: ["container", "top"],
        argumentNames: ["container"],
        appendArguments: true,
    });

    if (ps) {
        splatted.push(...ps);
    }

    return docker(splatted, options);
}

/**
 * The arguments for a Docker unpause command.
 */
export interface DockerContainerUnpauseArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container.
     */
    container: string[];
}

/**
 * Creates an executable `DockerCommand` for `docker unpause` which unpauses
 * all processes within one or more containers.
 * @param args The arguments for the Docker pause command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function unpause(args: DockerContainerUnpauseArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "unpause"],
            argumentNames: ["container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker update command.
 */
export interface DockerContainerUpdateArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container.
     */
    container: string[];

    /**
     * Block IO (relative weight), between 10 and 1000, or 0 to disable (default 0)
     */
    blkioWeight?: number;

    /**
     * Limit CPU CFS (Completely Fair Scheduler) period
     */
    cpuPeriod?: number;

    /**
     * Limit CPU CFS (Completely Fair Scheduler) quota
     */
    cpuQuota?: number;

    /**
     * Limit the CPU real-time period in microseconds
     */
    cpuRtPeriod?: number;

    /**
     * Limit the CPU real-time runtime in microseconds
     */
    cpuRtRuntime?: number;

    /**
     * CPU shares (relative weight)
     */
    cpuShares?: number;

    /**
     * Number of CPUs
     */
    cpus?: number;

    /**
     * CPUs in which to allow execution (0-3, 0,1)
     */
    cpusetCpus?: string;

    /**
     * MEMs in which to allow execution (0-3, 0,1)
     */
    cpusetMems?: string;

    /**
     * Memory limit
     */
    memory?: string;

    /**
     * Memory soft limit
     */
    memoryReservation?: string;

    /**
     * Swap limit equal to memory plus swap: -1 to enable unlimited swap
     */
    memorySwap?: string;

    /**
     * Tune container pids limit (set -1 for unlimited)
     */
    pidsLimit?: number;

    /**
     * Restart policy to apply when a container exits
     */
    restart?: "no" | "on-failure" | "always" | "unless-stopped" | string;
}

/**
 * Creates an executable `DockerCommand` for `docker pause` which updates
 * the configuration of one or more containers.
 * @param args The arguments for the Docker pause command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function update(args: DockerContainerUpdateArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "update"],
            argumentNames: ["container"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker wait command.
 */
export interface DockerContainerWaitArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the container.
     */
    container: string[];
}

/**
 * Creates an executable `DockerCommand` for `docker wait` which blocks
 * until a container stops, then prints the container's exit code.
 * @param args The arguments for the Docker wait command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function wait(args: DockerContainerWaitArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["container", "wait"],
            argumentNames: ["container"],
            appendArguments: true,
        }),
        options,
    );
}
