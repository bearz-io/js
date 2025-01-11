import { type CommandOptions, splat } from "@bearz/exec";
import { docker, type DockerCommand, type DockerGlobalArgs } from "../command.ts";

/**
 * The arguments for a Docker build command.
 */
export interface DockerImageBuildArgs extends DockerGlobalArgs {
    /**
     * The path to the build context (default ".")
     */
    path?: string;

    /**
     * Add a custom host-to-IP mapping (format: "host:ip")
     */
    addHost?: string[];

    /**
     * Allow extra privileged entitlement (e.g., "network.host", "security.insecure")
     */
    allow?: string[];

    /**
     * Add annotation to the image
     */
    annotation?: string[];

    /**
     * Attestation parameters (format: "type=sbom,generator=image")
     */
    attest?: string[];

    /**
     * Set build-time variables
     */
    buildArg?: string[];

    /**
     * Additional build contexts (e.g., name=path)
     */
    buildContext?: string[];

    /**
     * Override the configured builder instance (default "default")
     */
    builder?: string;

    /**
     * External cache sources (e.g., "user/app:cache", "type=local,src=path/to/dir")
     */
    cacheFrom?: string[];

    /**
     * Cache export destinations (e.g., "user/app:cache", "type=local,dest=path/to/dir")
     */
    cacheTo?: string[];

    /**
     * Set method for evaluating build ("check", "outline", "targets") (default "build")
     */
    call?: string;

    /**
     * Set the parent cgroup for the "RUN" instructions during build
     */
    cgroupParent?: string;

    /**
     * Shorthand for "--call=check" (default )
     */
    check?: boolean;

    /**
     * Enable debug logging
     */
    debug?: boolean;

    /**
     * Name of the Dockerfile (default: "PATH/Dockerfile")
     */
    file?: string;

    /**
     * Write the image ID to a file
     */
    iidfile?: string;

    /**
     * Set metadata for an image
     */
    label?: string[];

    /**
     * Shorthand for "--output=type=docker"
     */
    load?: boolean;

    /**
     * Write build result metadata to a file
     */
    metadataFile?: string;

    /**
     * Set the networking mode for the "RUN" instructions during build (default "default")
     */
    network?: string;

    /**
     * Do not use cache when building the image
     */
    noCache?: boolean;

    /**
     * Do not cache specified stages
     */
    noCacheFilter?: string[];

    /**
     * Output destination (format: "type=local,dest=path")
     */
    output?: string[];

    /**
     * Set target platform for build
     */
    platform?: string[];

    /**
     * Set type of progress output ("auto", "plain", "tty", "rawjson"). Use plain to show container output (default "auto")
     */
    progress?: "auto" | "plain" | "tty" | "rawjson" | string;

    /**
     * Shorthand for "--attest=type=provenance"
     */
    provenance?: string;

    /**
     * Always attempt to pull all referenced images
     */
    pull?: boolean;

    /**
     * Shorthand for "--output=type=registry"
     */
    push?: boolean;

    /**
     * Suppress the build output and print image ID on success
     */
    quiet?: boolean;

    /**
     * Shorthand for "--attest=type=sbom"
     */
    sbom?: string;

    /**
     * Secret to expose to the build (format "id=mysecret[,src=/local/secret]")
     */
    secret?: string[];

    /**
     * Shared memory size for build containers
     */
    shmSize?: string;

    /**
     * SSH agent socket or keys to expose to the build (format: "default|<id>[=<socket>|<key>[,<key>]]")
     */
    ssh?: string[];

    /**
     * Name and optionally a tag (format: "name:tag")
     */
    tag?: string[];

    /**
     * Set the target build stage to build
     */
    target?: string;

    /**
     * Ulimit options (default [])
     */
    ulimit?: string;
}

/**
 * Creates an execution command for the Docker build command which
 * builds a Docker image.
 * @param args The arguments for the Docker build command.
 * @param options The options for the command.
 * @returns `DockerCommand`.
 */
export function build(args: DockerImageBuildArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["image", "build"],
            argumentNames: ["path"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker history command.
 */
export interface DockerImageHistoryArgs extends DockerGlobalArgs {
    /**
     * The name or ID of the image.
     */
    image: string;

    /**
     * Format the output using a custom template.
     */
    format?: "table" | "json" | string;

    /**
     * Prints sizes and dates in a human readable format.
     */
    human?: boolean;

    /**
     * Do not truncate output.
     */
    noTrunc?: boolean;

    /**
     * Only display image IDs.
     */
    quiet?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker history` which
 * shows the history of an image.
 * @param args The arguments for the Docker history command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function history(args: DockerImageHistoryArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["image", "history"],
            argumentNames: ["image"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker import command.
 */
export interface DockerImageImportArgs extends DockerGlobalArgs {
    /**
     * file|URL|- for reading from STDIN.
     */
    file?: string;

    /**
     * [REPOSITORY[:TAG]]
     */
    repository?: string;

    /**
     * Apply Dockerfile instruction to the created image.
     */
    change?: string[];

    /**
     * Set commit message for imported image.
     */
    message?: string;

    /**
     * Set platform if server is multi-platform capable.
     */
    platform?: string;
}

/**
 * Creates an executable `DockerCommand` for `docker import` which
 * imports the contents from a tarball to create a filesystem image.
 *
 * @description
 * The function is named imports as `import` is a reserved keyword in JavaScript.
 *
 * @param args The arguments for the Docker import command.
 * @param options The options for the Docker command.
 * @returns
 */
export function imports(args: DockerImageImportArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["image", "import"],
            argumentNames: ["file", "repository", "change", "message", "platform"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker image inspect command.
 */
export interface DockerImageInspectArgs extends DockerGlobalArgs {
    /**
     * Name or ID of the image
     */
    image: string[];

    /**
     * Format the output using the given Go template
     */
    format?: "json" | string;
}

/**
 * Creates an executable `DockerCommand` for `docker image inspect` which
 * inspects an image.
 * @param args The arguments for the Docker image inspect command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function inspect(args: DockerImageInspectArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["image", "inspect"],
            argumentNames: ["image"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker image load command.
 */
export interface DockerImageLoadArgs extends DockerGlobalArgs {
    /**
     * Read from `tar` archive file, instead of STDIN.
     */
    input?: string;

    /**
     * Suppress the load output
     */
    quiet?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker load` which
 * loads an image from a `tar` archive or STDIN.
 * @param args The arguments for the Docker image load command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function load(args: DockerImageLoadArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["image", "load"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker image ls command.
 */
export interface DockerImageLsArgs extends DockerGlobalArgs {
    /**
     * [REPOSITORY[:TAG]] to match.
     */
    repository?: string;

    /**
     * Show all images (default hides intermediate images).
     */
    all?: boolean;

    /**
     * Show digests.
     */
    digests?: boolean;

    /**
     * Filter output based on conditions provided.
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
     * Only show numeric IDs.
     */
    quiet?: boolean;

    /**
     * List multi-platform images as a tree. (experimental)
     */
    tree?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker image ls` which
 * lists images.
 * @param args The arguments for the Docker image ls command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function ls(args: DockerImageLsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["image", "ls"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker image prune command.
 */
export interface DockerImagePruneArgs extends DockerGlobalArgs {
    /**
     * Remove all unused images not just dangling ones
     */
    all?: boolean;

    /**
     * Remove all unused images older than duration
     */
    filter?: string;

    /**
     * Do not prompt for confirmation
     */
    force?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker image prune` which
 * removes unused images.
 * @param args The arguments for the Docker image prune command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function prune(args: DockerImagePruneArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["image", "prune"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker image pull command.
 */
export interface DockerImagePullArgs extends DockerGlobalArgs {
    /**
     * NAME[:TAG|@DIGEST]  The name of the image to pull.
     */
    name: string;

    /**
     * Download all tagged images in the repository.
     */
    allTags?: boolean;

    /**
     * Skip image verification. (default true)
     */
    disableContentTrust?: boolean;

    /**
     * Set platform if server is multi-platform capable
     */
    platform?: string;

    /**
     * Suppress verbose output.
     */
    quiet?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker image pull` which
 * pulls an image from a registry.
 * @param args The arguments for the Docker image pull command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function pull(args: DockerImagePullArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["image", "pull"],
            argumentNames: ["name"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker image push command.
 */
export interface DockerImagePushArgs extends DockerGlobalArgs {
    /**
     * NAME[:TAG] of the image to push
     */
    name: string;

    /**
     * Push all tagged images in the repository.
     */
    allTags?: boolean;

    /**
     * Push a platform-specific manifest as a single-platform
     * image to the registry.  Image index won't be pushed,
     * meaning that other manifests, including attestations
     * won't be preserved.
     * 'os[/arch[/variant]]': Explicit platform e.g. linux/amd64
     */
    pltform?: string;

    /**
     * Suppress verbose output.
     */
    quiet?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker image push` which
 * pushes an image to a registry.
 * @param args The arguments for the Docker image push command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function push(args: DockerImagePushArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["image", "push"],
            argumentNames: ["name"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker image rm command.
 */
export interface DockerImageRmArgs extends DockerGlobalArgs {
    /**
     * Name or ID of the image
     */
    image: string[];

    /**
     * Force removal of the image
     */
    force?: boolean;

    /**
     * Do not delete untagged parents
     */
    noPrune?: boolean;
}

/**
 * Creates an executable `DockerCommand` for `docker image rm` which
 * removes one or more images.
 * @param args The arguments for the Docker image rm command.
 * @param options The options for the Docker command.
 * @returns DockerCommand.
 */
export function rm(args: DockerImageRmArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["image", "rm"],
            argumentNames: ["image"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker image save command.
 */
export interface DockerImageSaveArgs extends DockerGlobalArgs {
    /**
     * Name or ID of the image
     */
    image: string[];

    /**
     * Write to `tar` archive file, instead of STDOUT.
     */
    output?: string;
}

/**
 * Creates an executable `DockerCommand` for `docker image save` which
 * saves one or more images to a `tar` archive (streamed to STDOUT by default).
 * @param args The arguments for the Docker image save command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function save(args: DockerImageSaveArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["image", "save"],
            argumentNames: ["image"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker image tag command.
 */
export interface DockerImageTagArgs extends DockerGlobalArgs {
    /**
     * [SRC_IMAGE[:TAG]]
     */
    src: string;

    /**
     * [TARGET_IMAGE[:TAG]]
     */
    target: string;
}

/**
 * Creates an executable `DockerCommand` for `docker image tag` which
 * tags an image to a target repository.
 * @param args The arguments for the Docker image tag command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function tag(args: DockerImageTagArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["image", "tag"],
            argumentNames: ["src", "target"],
            appendArguments: true,
        }),
        options,
    );
}
