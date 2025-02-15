export * from "./command.ts";
import type { CommandOptions } from "@bearz/exec";
import { type ComposeGlobalArgs, DockerComposeCommand, splatCompose } from "./command.ts";

/**
 * The arguments for the Docker Compose attach command.
 */
export interface DockerComposeAttachArgs extends ComposeGlobalArgs {
    /**
     * The name of the service to attach to.
     */
    service: string;

    /**
     * The detach keys to use for detaching a container. (default "ctrl-p,ctrl-q")
     */
    detachKeys?: string;

    /**
     * Execute command in dry run mode. (default false)
     */
    dryRun?: boolean;

    /**
     * index of the container if service has multiple replicas.
     */
    index?: number;

    /**
     * Do not attach STDIN
     */
    noStdin?: boolean;

    /**
     * Proxy all received signals to the process. (default true)
     */
    sigProxy?: boolean;
}

/**
 * Creates a DockerComposeCommand that attaches to a service.
 * @param args The arguments for the `attach` command.
 * @param options The options for the `attach` command.
 * @returns `DockerComposeCommand` that attaches to a service.
 */
export function attach(
    args: DockerComposeAttachArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["attach"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose build command.
 */
export interface DockerComposeBuildArgs extends ComposeGlobalArgs {
    /**
     * The name of the service to build. (default all)
     */
    service?: string[];

    /**
     * Set build-time variables for services.
     */
    buildArgs?: string[];

    /**
     * Set builder to use.
     */
    builder?: string;

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Set memory limit for the build container.
     */
    memory?: string;

    /**
     * Do not use cache when building the image.
     */
    noCache?: boolean;

    /**
     * Always attempt to pull a newer version of the image.
     */
    pull?: boolean;

    /**
     * Push service images.
     */
    push?: boolean;

    /**
     * Dont' print anything to STDOUT
     */
    quiet?: boolean;

    /**
     * Set SSH authentication used when build service images. (use 'default'
     * for using your default SSH Agent)
     */
    ssh?: string;

    /**
     * Also build dependencies (transitively).
     */
    withDependences?: boolean;
}

/**
 * Creates a DockerComposeCommand that builds a service.
 * @param args The arguments for the `build` command.
 * @param options The options for the `build` command.
 * @returns `DockerComposeCommand` that builds a service.
 */
export function build(
    args: DockerComposeBuildArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["build"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose commit command.
 */
export interface DockerComposeCommitArgs extends ComposeGlobalArgs {
    /**
     * The name of the service to commit.
     */
    service: string;

    /**
     * [REPOSTORY[:TAG]] The repository and tag to be applied to the image.
     */
    repository?: string;

    /**
     * Author (e.g. "John Hannibal Smith <hannibal@a-team.com>")
     */
    author?: string;

    /**
     * Apply Dockerfile instruction to the created image.
     */
    change?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * index of the container if service has multiple replicas.
     */
    index?: number;

    /**
     * Commit message.
     */
    message?: string;

    /**
     * Pause container during commit. (default true)
     */
    pause?: boolean;
}

/**
 * Creates a DockerComposeCommand that commits a service.
 * @param args The arguments for the `commit` command.
 * @param options The options for the `commit` command.
 * @returns `DockerComposeCommand` that commits a service.
 */
export function commit(
    args: DockerComposeCommitArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["commit"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose config command.
 */
export interface DockerComposeConfigArgs extends ComposeGlobalArgs {
    /**
     * The name of the service to target.
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Print environment used for interpolation.
     */
    environment?: boolean;

    /**
     * Format the output. Values: [yaml | json]. (default "yaml")
     */
    format?: "yaml" | "json";

    /**
     * Print the service config hash, one per line.
     */
    hash?: string;

    /**
     * Print the image names, one per line.
     */
    images?: boolean;

    /**
     * Don't check model consistency. warning:
     * may produce invalid Compose output
     */
    noConsistency?: boolean;

    /**
     * Don't interpolate environment variables.
     */
    noInterpolate?: boolean;

    /**
     * don't normalize compose model
     */
    noNormalize?: boolean;

    /**
     * Don't resolve file paths.
     */
    noPathResolution?: boolean;

    /**
     * Save to file (default to stdout).
     */
    output?: string;

    /**
     * Print the profile names, one per line.
     */
    profiles?: boolean;

    /**
     * One validaate the configuration, don't print anything.
     */
    quiet?: boolean;

    /**
     * Pin image tags to digests.
     */
    resolveImageDigests?: boolean;

    /**
     * Print the service names, one per line.
     */
    services?: boolean;

    /**
     * Print model variables and default values.
     */
    variables?: boolean;

    /**
     * Print the volume name, one per line.
     */
    volumes?: boolean;
}

export function config(
    args: DockerComposeConfigArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["config"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

export interface DockerComposeCpArgs extends ComposeGlobalArgs {
    /**
     * If copying from the servicde, use  SERVICE:SRC_PATH. Otherwise,
     * use SRC_PATH as a local file path.
     */
    src: string;

    /**
     * If copying to the service, use SERVICE:DEST_PATH.
     * Otherwise, use DEST_PATH as a local file path.
     */
    dest: string;

    /**
     * Include containers created by the run command.
     */
    all?: boolean;

    /**
     * Archive mode (copy all uid/guid information).
     */
    archive?: boolean;

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Always follow symbol link in SRC_PATH.
     */
    followLink?: boolean;

    /**
     * index of the container if service has multiple replicas.
     */
    index?: number;
}

/**
 * Copies files/folders between a service and the local filesystem.
 * @param args The arguments for the `cp` command.
 * @param options The options for the `cp` command.
 * @returns `DockerComposeCommand` that copies files between a service and the local filesystem.
 */
export function cp(args: DockerComposeCpArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["cp"];
    args.splat.argumentNames = ["src", "dest"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose create command.
 */
export interface DockerComposeCreateArgs extends ComposeGlobalArgs {
    /**
     * Specifies the services to create.
     */
    service?: string[];

    /**
     * Build images before starting containers.
     */
    build?: boolean;

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Recreate containers even if their configuration and image haven't changed.
     */
    forceRecreate?: boolean;

    /**
     * Do not build an image, even if it's missing.
     */
    noBuild?: boolean;

    /**
     * If containers already exist, don't recreate them. Incompatible with --force-recreate.
     */
    noRecreate?: boolean;

    /**
     * Pull image before running
     */
    pull?: "always" | "missing" | "never" | "build" | string;

    /**
     * Pull without printing progress information..
     */
    quietPull?: boolean;

    /**
     * Remove container for services not defined in the compose file.
     */
    removeOrphans?: boolean;

    /**
     * Scale SERVICE to NUM instances. Overrides the
     * scale setting in the Compose file if present.
     */
    scale?: number;

    /**
     * Assume "yes" as answer to all prompts and run non-interactively.
     */
    y?: boolean;
}

/**
 * Creates a service.
 * @param args The arguments for the `create` command.
 * @param options The options for the `create` command.
 * @returns `DockerComposeCommand` that creates a service.
 */
export function create(
    args: DockerComposeCreateArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["create"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * Represents the arguments for the `down` command in Docker Compose.
 */
export interface DockerComposeDownArgs extends ComposeGlobalArgs {
    /**
     * If `true`, performs a dry run of the `down` command without making any changes.
     */
    dryRun?: boolean;

    /**
     * If `true`, removes containers for services not defined in the Compose file.
     */
    removeOrphans?: boolean;

    /**
     * Specifies the scope of images to remove. Possible values are "all" or "local".
     */
    rmi?: "all" | "local";

    /**
     * Specifies the services to target for the `down` command.
     */
    services?: string[];

    /**
     * Specifies the timeout (in seconds) for stopping containers. Defaults to 10 seconds.
     */
    timeout?: number;

    /**
     * If `true`, removes named volumes declared in the Compose file.
     */
    volumes?: boolean;
}

/**
 * Stops and removes the containers, networks, and volumes defined in the Docker Compose file.
 *
 * @param args - The arguments for the `down` command.
 * @param options - The options for the `down` command.
 * @returns A `DockerComposeCommand` instance representing the `down` command.
 */
export function down(args: DockerComposeDownArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["up"];
    args.splat.arguments = ["services"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose event command.
 */
export interface DockerComposeEventArgs extends ComposeGlobalArgs {
    /**
     * Specifies the services to target for the `event` command.
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Output events as a stream in JSON format.
     */
    json?: boolean;
}

/**
 * Creates a DockerComposeCommand that shows real-time events from containers.
 * @param args The arguments for the `event` command.
 * @param options The options for the `event` command.
 * @returns `DockerComposeCommand` that shows real-time events from containers.
 */
export function event(
    args: DockerComposeEventArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["event"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

export interface DockerComposeExecArgs extends ComposeGlobalArgs {
    /**
     * The name of the service to execute the command in.
     */
    service: string;

    /**
     * The command to execute in the service container.
     */
    command: string;

    /**
     * Additional arguments to pass to the command.
     */
    args?: string[];

    /**
     * Detached mode: Run command in the background.
     */
    detach?: boolean;

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Set environment variables for the command.
     */
    env?: string[];

    /**
     * index of the container if service has multiple replicas.
     */
    index?: number;

    /**
     * Disable pseudo-TTY allocation. By default, `docker-compose exec` allocates a TTY.
     */
    noTTY?: boolean;

    /**
     * Give extended privileges to the process.
     */
    privileged?: boolean;

    /**
     * Run the command as this user. (default root)
     */
    user?: string;

    /**
     * Path to workdir directory for this command. (default /)
     */
    workdir?: string;
}

/**
 * Executes a command in a running service container.
 */
export function exec(args: DockerComposeExecArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["exec"];
    args.splat.argumentNames = ["service", "command"];
    args.splat.appendArguments = true;
    args.splat.aliases = { "noTTY": "T" };

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * Exports the contents of a service's filesystem as a tar archive.
 */
export interface DockerComposeExportArgs extends ComposeGlobalArgs {
    /**
     * The name of the service to export.
     */
    service: string;

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * index of the container if service has multiple replicas.
     */
    index?: number;

    /**
     * Write to a file instead of STDOUT.
     */
    output?: string;
}

/**
 * Creates a DockerComposeCommand that exports the contents of a service's filesystem as a tar archive.
 * @param args The arguments for the `export` command.
 * @param options The options for the `export` command.
 * @returns `DockerComposeCommand` that exports the contents of a service's filesystem as a tar archive.
 */
export function exports(
    args: DockerComposeExportArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["export"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * Arguments for the Docker Compose images command.
 */
export interface DockerComposeImagesArgs extends ComposeGlobalArgs {
    /**
     * The services to target for the `images` command.
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Format the output. Values: [table | json].
     */
    format?: "table" | "json";

    /**
     * Only display  IDs.
     */
    quiet?: boolean;
}

/**
 * Creates a DockerComposeCommand that lists images used by the services.
 * @param args The arguments for the `images` command.
 * @param options The options for the `images` command.
 * @returns `DockerComposeCommand` that lists images used by the services.
 */
export function images(
    args: DockerComposeImagesArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["images"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose kill command.
 */
export interface DockerComposeKillArgs extends ComposeGlobalArgs {
    /**
     * The services to target for the `kill` command.
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Remove containers for services not defined in the Compose file.
     */
    removeOrphans?: boolean;

    /**
     * Signal to send to the container. (default SIGKILL)
     */
    signal?: string;
}

/**
 * Creates a DockerComposeCommand that kills the specified services.
 * @param args The arguments for the `kill` command.
 * @param options The options for the `kill` command.
 * @returns `DockerComposeCommand` that kills the specified services.
 */
export function kill(args: DockerComposeKillArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["kill"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

export interface DockerComposeLogsArgs extends ComposeGlobalArgs {
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Follow log output.
     */
    follow?: boolean;

    /**
     * Index of the container if the service has multiple replicas.
     */
    index?: number;

    /**
     * Produce monochrome output.
     */
    noColor?: boolean;

    /**
     * Don't print prefix in logs.
     */
    noLogPrefix?: boolean;

    /**
     * Show logs since timestamp, for example 2013-01-02T13:23:37 or relative (e.g. 42m for 42 minutes).
     */
    since?: string;

    /**
     * Number of lines to show from the end of the logs for each container. (default "all")
     */
    tail?: string;

    /**
     * Show timestamps.
     */
    timestamps?: boolean;

    /**
     * Show logs before a certain timestamp, for example 2013-01-02T13:23:37 or relative (e.g. 42m for 42 minutes).
     */
    until?: string;
}

/**
 * Creates an executable DockerComposeCommand that shows logs from containers.
 * @param args The arguments for the `logs` command.
 * @param options The options for the `logs` command.
 * @returns `DockerComposeCommand` that shows logs from containers.
 */
export function logs(args: DockerComposeLogsArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["logs"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

export interface DockerComposeLsArgs extends ComposeGlobalArgs {
    /**
     * Show all stopped Compose projects.
     */
    all?: boolean;

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Filter output based on conditions provided.
     */
    filter?: string;

    /**
     * Format the output. Values: [table | json].
     */
    format?: "table" | "json";

    /**
     * Only display IDs.
     */
    quiet?: boolean;
}

/**
 * Create an executable DockerComposeCommand that lists Docker Compose projects.
 * @param args The arguments for the `ls` command.
 * @param options The options for the `ls` command.
 * @returns `DockerComposeCommand` that lists Docker Compose projects.
 */
export function ls(args: DockerComposeLsArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["ls"];

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose pause command.
 */
export interface DockerComposePauseArgs extends ComposeGlobalArgs {
    /**
     * The services to target for the `pause` command.
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;
}

/**
 * Creates a DockerComposeCommand that pauses the specified services.
 * @param args The arguments for the `pause` command.
 * @param options The options for the `pause` command.
 * @returns `DockerComposeCommand` that pauses the specified services.
 */
export function pause(
    args: DockerComposePauseArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["pause"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose port command.
 */
export interface DockerComposePortArgs extends ComposeGlobalArgs {
    /**
     * The name of the service to target.
     */
    service: string;

    /**
     * The port to display.
     */
    port: number;

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Index of the container if the service has multiple replicas.
     */
    index?: number;

    /**
     * The protocol to use for the port. (default "tcp")
     */
    protocol?: "tcp" | "udp";
}

/**
 * Creates a DockerComposeCommand that displays the public port for a service.
 * @param args The arguments for the `port` command.
 * @param options The options for the `port` command.
 * @returns `DockerComposeCommand` that displays the public port for a service.
 */
export function port(args: DockerComposePortArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["port"];
    args.splat.argumentNames = ["service", "port"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

export interface DockerComposePsArgs extends ComposeGlobalArgs {
    /**
     * The services to target for the `ps` command.
     */
    service?: string[];

    /**
     * Show all stopped containers (including those created by the run command.,)
     */
    all?: boolean;

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Filter services by a property (supported filters: status)
     */
    filter?: string;

    /**
     * Format the output. Values: [table | json].
     */
    format?: "table" | "json" | string;

    /**
     * Do not truncate output.
     */
    noTrunc?: boolean;

    /**
     * Include orphaned services (not declared by project) (default true)
     */
    orphans?: boolean;

    /**
     * Only display IDs.
     */
    quiet?: boolean;

    /**
     * Display services.
     */
    services?: boolean;

    /**
     * Filter services by status. Values: [running | exited | created | restarting | removing].
     */
    status?: ("running" | "exited" | "created" | "restarting" | "removing" | string)[];
}

/**
 * This function creates a DockerComposeCommand that lists containers.
 * @param args The arguments for the `ps` command.
 * @param options The options for the `ps` command.
 * @returns `DockerComposeCommand` that lists containers.
 */
export function ps(args: DockerComposePsArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["ps"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose pull command.
 */
export interface DockerComposePullArgs extends ComposeGlobalArgs {
    /**
     * The services
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Ignore images that can be built.
     */
    ignoreBuildable?: boolean;

    /**
     * Pull what it can and ignores images with pull failures.
     */
    ignorePullFailures?: boolean;

    /**
     * Also pull services declared as dependencies.
     */
    includeDeps?: boolean;

    /**
     * Apply pull policy ("missing" or "always").
     */
    policy?: "missing" | "always" | string;

    /**
     * Pull without printing progress information.
     */
    quiet?: boolean;
}

/**
 * Creates a DockerComposeCommand that pulls images for the specified services.
 * @param args The arguments for the `pull` command.
 * @param options The options for the `pull` command.
 * @returns `DockerComposeCommand` that pulls images for the specified services.
 */
export function pull(args: DockerComposePullArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["pull"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose push command.
 */
export interface DockerComposePushArgs extends ComposeGlobalArgs {
    /**
     * The services
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Push what it can and ignores images with push failures.
     */
    ignorePushFailures?: boolean;

    /**
     * Also push services declared as dependencies.
     */
    includeDeps?: boolean;

    /**
     * Push without printing progress information.
     */
    quiet?: boolean;
}

/**
 * Creates a DockerComposeCommand that pushes images for
 * the specified services.
 * @param args The arguments for the `push` command.
 * @param options The options for the `push` command.
 * @returns `DockerComposeCommand` that pushes images for the specified services.
 */
export function push(args: DockerComposePushArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["push"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose restart command.
 */
export interface DockerComposeRestartArgs extends ComposeGlobalArgs {
    /**
     * The services to target for the `restart` command.
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * If set to true, the command will not restart linked services.
     */
    noDeps?: boolean;

    /**
     * Specifies the timeout in seconds for container startup. (default 10)
     */
    timeout?: number;
}

/**
 * Creates a DockerComposeCommand that restarts the specified services.
 * @param args The arguments for the `restart` command.
 * @param options The options for the `restart` command.
 * @returns `DockerComposeCommand` that restarts the specified services.
 */
export function restart(
    args: DockerComposeRestartArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["restart"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

export interface DockerComposeRunArgs extends ComposeGlobalArgs {
    /**
     * The name of the service to run the command against.
     */
    service: string;

    /**
     * The command to run in the service container.
     */
    command?: string;

    /**
     * Additional arguments to pass to the command.
     */
    args?: string[];

    /**
     * Build images before starting containers.
     */
    build?: boolean;

    /**
     * Add linux capabilities to the container.
     */
    capAdd?: string[];

    /**
     * Drop linux capabilities from the container.
     */
    capDrop?: string[];

    /**
     * Run container in background and print container ID..
     */
    detach?: boolean;

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Override the default ENTRYPOINT of the image. (default "")
     */
    entrypoint?: string;

    /**
     * Set environment variables.
     */
    env?: string[];

    /**
     * Keep STDIN open even if not attached. (default true)
     */
    interactive?: boolean;

    /**
     * Add or override a label.
     */
    label?: string[];

    /**
     * Assign a name to the container.
     */
    name?: string;

    /**
     * Disable pseudo-TTY allocation. By default, `docker-compose run` allocates a TTY.
     */
    noTTY?: boolean;

    /**
     * Don't start linked services.
     */
    noDeps?: boolean;

    /**
     * Publish a containers ports(s to the host)
     */
    publish?: string[];

    /**
     * Pulll without printing progress information.
     */
    quietPull?: boolean;

    /**
     * Remove containers for services not defined in the Compose file.
     */
    removeOrphans?: boolean;

    /**
     * Automatically remove the container when it exits.
     */
    rm?: boolean;

    /**
     * Run command with all service's prots enabled and mapped to the host.
     */
    servicePorts?: boolean;

    /**
     * Use the service's network useAliases in the network(s) the container connects to.
     */
    useAliases?: boolean;

    /**
     * Run as specified username or uid.
     */
    user?: string;

    /**
     * Bind mount a volumen
     */
    volume?: string[];

    /**
     * Working directory inside the container.
     */
    workdir?: string;
}

/**
 * Creates a DockerComposeCommand that runs a one-time command against a service.
 * @param args The arguments for the `run` command.
 * @param options The options for the `run` command.
 * @returns `DockerComposeCommand` that runs a one-time command against a service.
 */
export function run(args: DockerComposeRunArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["run"];
    args.splat.argumentNames = ["service", "command", "args"];
    args.splat.aliases = { "noTTY": "T" };
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose scale command.
 */
export interface DockerComposeScaleArgs extends ComposeGlobalArgs {
    /**
     * [SERVICE=REPLICAS...] Scale SERVICE to REPLICAS.
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Dont' start linked services
     */
    noDeps?: boolean;
}

/**
 * Creates a DockerComposeCommand that scales the specified services.
 * @param args The arguments for the `scale` command.
 * @param options The options for the `scale` command.
 * @returns `DockerComposeCommand` that scales the specified services.
 */
export function scale(
    args: DockerComposeScaleArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["scale"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose start command.
 */
export interface DockerComposeStartArgs extends ComposeGlobalArgs {
    /**
     * The services
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;
}

/**
 * Creates a DockerComposeCommand that starts the specified services.
 * @param args The arguments for the `start` command.
 * @param options The options for the `start` command.
 * @returns `DockerComposeCommand` that starts the specified services.
 */
export function start(
    args: DockerComposeStartArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["start"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

export interface DockerComposeStatsArgs extends ComposeGlobalArgs {
    /**
     * The services to target for the `stats` command.
     */
    service?: string;

    /**
     * Show all containers. (default shows just running)
     */
    all?: boolean;

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Format output using a custom template.
     */
    format?: "json" | "table" | string;

    /**
     * Disable streaming stats and only pull the first result.
     */
    noStream?: boolean;

    /**
     * Do not truncate output.
     */
    noTrunc?: boolean;
}

/**
 * Creates a DockerComposeCommand that displays a live stream of container(s) resource usage statistics.
 * @param args The arguments for the `stats` command.
 * @param options The options for the `stats` command.
 * @returns `DockerComposeCommand` that displays a live stream of container(s) resource usage statistics.
 */
export function stats(
    args: DockerComposeStatsArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["stats"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose stop command.
 */
export interface DockerComposeStopArgs extends ComposeGlobalArgs {
    /**
     * The services
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */

    dryRun?: boolean;

    /**
     * Specify a shutdown timeout in seconds.
     */
    timeout?: number;
}

/**
 * Creates a DockerComposeCommand that stops the specified services.
 * @param args The arguments for the `stop` command.
 * @param options The options for the `stop` command.
 * @returns `DockerComposeCommand` that stops the specified services.
 */
export function stop(args: DockerComposeStopArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["stop"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose top command.
 */
export interface DockerComposeTopArgs extends ComposeGlobalArgs {
    /**
     * The services
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;
}

export function top(args: DockerComposeTopArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["top"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose unpause command.
 */
export interface DockerComposeUnpauseArgs extends ComposeGlobalArgs {
    /**
     * The services to target for the `unpause` command.
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;
}

/**
 * Creates a DockerComposeCommand that unpauses the specified services.
 * @param args The arguments for the `unpause` command.
 * @param options The options for the `unpause` command.
 * @returns `DockerComposeCommand` that unpauses the specified services.
 */
export function unpause(
    args: DockerComposeUnpauseArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["unpause"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * Represents the arguments for the "up" command in the Docker Compose CLI.
 */
export interface DockerComposeUpArgs extends ComposeGlobalArgs {
    /**
     * If set to true, the command will abort if any container exits.
     */
    abortOnContainerExit?: boolean;

    /**
     * If set to true, all dependent services will be recreated even if they are already running.
     */
    alwaysRecreateDeps?: boolean;

    /**
     * If set to true, the command will build images before starting containers.
     */
    build?: boolean;

    /**
     * If set to true, the command will run containers in the background and print container IDs.
     */
    detach?: boolean;

    /**
     * If set to true, the command will perform a dry run without starting containers.
     */
    dryRun?: boolean;

    /**
     * Specifies the exit code from the service container(s) to use as the exit code for the "up" command.
     */
    exitCodeFrom?: string;

    /**
     * If set to true, all containers will be recreated even if they haven't changed.
     */
    forceRecreate?: boolean;

    /**
     * An array of service names to exclude from attaching logs.
     */
    noAttach?: string[];

    /**
     * If set to true, the command will not build images before starting containers.
     */
    noBuild?: boolean;

    /**
     * If set to true, the command will not output colored output.
     */
    noColor?: boolean;

    /**
     * If set to true, the command will not start linked services.
     */
    noDeps?: boolean;

    /**
     * If set to true, the command will not prefix log lines with timestamps.
     */
    noLogPrefix?: boolean;

    /**
     * If set to true, the command will not recreate containers that are already running.
     */
    noRecreate?: boolean;

    /**
     * If set to true, the command will not start the services after creating containers.
     */
    noStart?: boolean;

    /**
     * Specifies when to pull images for services. Possible values are "always", "policy", or "never".
     */
    pull?: "always" | "policy" | "never";

    /**
     * If set to true, the command will pull without printing progress information.
     */
    quietPull?: boolean;

    /**
     * If set to true, the command will remove containers for services not defined in the Compose file.
     */
    removeOrphans?: boolean;

    /**
     * If set to true, anonymous volumes will be recreated instead of reused.
     */
    renewAnonVolumes?: boolean;

    /**
     * Specifies the number of containers to run for a service.
     */
    scale?: number;

    /**
     * An array of service names to start.
     */
    services?: string[];

    /**
     * Specifies the timeout in seconds for container startup.
     */
    timeout?: number;

    /**
     * If set to true, the command will print timestamps for log lines.
     */
    timestamps?: boolean;

    /**
     * If set to true, the command will wait for services to be fully started before exiting.
     */
    wait?: boolean;

    /**
     * Specifies the timeout in seconds for the service startup.
     */
    waitTimeout?: number;
}

/**
 * Starts the specified services defined in the Docker Compose file.
 *
 * @param args - The arguments for the `up` command.
 * @param options - The options for the `up` command.
 * @returns A `DockerComposeCommand` instance representing the `up` command.
 */
export function up(args: DockerComposeUpArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.argumentNames = ["services"];
    args.splat.command = ["up"];

    return new DockerComposeCommand(args, options);
}

/**
 * The arguments for the Docker Compose wait command.
 */
export interface DockerComposeWaitArgs extends ComposeGlobalArgs {
    /**
     * The services to wait for.
     */
    service: string[];

    /**
     * Drops project when the first container stops.
     */
    downProject?: boolean;

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;
}

/**
 * Creates a DockerComposeCommand that waits for the specified services to be ready.
 * @param args The arguments for the `wait` command.
 * @param options The options for the `wait` command.
 * @returns `DockerComposeCommand` that waits for the specified services to be ready.
 */
export function wait(args: DockerComposeWaitArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["wait"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}

/**
 * The arguments for the Docker Compose watch command.
 */
export interface DockerComposeWatchArgs extends ComposeGlobalArgs {
    /**
     * The services to watch for changes.
     */
    service?: string[];

    /**
     * Execute command in dry run mode.
     */
    dryRun?: boolean;

    /**
     * Do not build and start services before watching.
     */
    noUp?: boolean;

    /**
     * Prune dangling images on rebuild.
     */
    prune?: boolean;

    /**
     * Hide build output.
     */
    quiet?: boolean;
}

/**
 * Creates a DockerComposeCommand that watches for changes in the specified services.
 * @param args The arguments for the `watch` command.
 * @param options The options for the `watch` command.
 * @returns `DockerComposeCommand` that watches for changes in the specified services.
 */
export function watch(
    args: DockerComposeWatchArgs,
    options?: CommandOptions,
): DockerComposeCommand {
    args.splat ??= {};
    args.splat.command = ["watch"];
    args.splat.argumentNames = ["service"];
    args.splat.appendArguments = true;

    return new DockerComposeCommand(splatCompose(args), options);
}
