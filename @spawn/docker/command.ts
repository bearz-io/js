import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    type SplatObject,
} from "@bearz/exec";

pathFinder.set("docker", {
    name: "docker",
    envVariable: "DOCKER_EXE",
    windows: [
        "${ProgramFiles}\\Docker\\Docker\\resources\\bin\\docker.exe",
    ],
    linux: [
        "/usr/local/bin/docker",
    ],
});

pathFinder.set("nerdctl", {
    name: "nerdctl",
    envVariable: "NERDCTL_EXE",
    windows: [
        "${ProgramFiles}\\Nerdctl\\nerdctl.exe",
        "${LOCALAPPDATA}\\Programs\\nerdctl\\nerdctl.exe",
        "${LOCALAPPDATA}\\Programs\\bin\\nerdctl.exe",
    ],
    linux: [
        "/usr/local/bin/nerdctl",
        "/usr/bin/nerdctl",
        "${HOME}/.local/bin/nerdctl",
    ],
});

let dockerExe = "docker";

export function setDockerExe(exe: "docker" | "nerdctl" | "podman"): void {
    dockerExe = exe;
}

/**
 * Represents a docker command.
 *
 * When using the SplatObject for CommandArgs, the
 * `prefix` and `assign` properties are set to "-" and "=" respectively.
 */
export class DockerCommand extends Command {
    /**
     * Creates a new instance of the `DockerCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super(dockerExe, args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            args.splat ??= {};
            args.splat.prefix = "--";
        }
    }

    useNerdctl(): this {
        this.file = "nerdctl";
        return this;
    }
}

/**
 * Executes the docker command line using the DockerCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the DockerCommand class.
 *
 * @example
 * ```typescript
 * import { docker } from "@spawn/docker";
 *
 * await docker("ps").run();
 * ```
 */
export function docker(args?: CommandArgs, options?: CommandOptions): DockerCommand {
    return new DockerCommand(args, options);
}

export interface DockerGlobalArgs extends SplatObject {
    /**
     * Location of client config files (default "/home/dev_user/.docker")
     */
    config?: string;

    /**
     * Name of the context to use to connect to the daemon (overrides
     * DOCKER_HOST env var and default context set with "docker context use")
     */
    context?: string;

    /**
     * Enable debug mode
     */
    debug?: boolean;

    /**
     * Daemon socket to connect to
     */
    host?: string[];

    /**
     * Set the logging level ("debug", "info", "warn", "error", "fatal") (default "info")
     */
    logLevel?: "debug" | "info" | "warn" | "error" | "fatal";

    /**
     * Use TLS; implied by --tlsverify
     */
    tls?: boolean;

    /**
     * Trust certs signed only by this CA (default "/home/dev_user/.docker/ca.pem")
     */
    tlscacert?: string;

    /**
     * Path to TLS certificate file (default "/home/dev_user/.docker/cert.pem")
     */
    tlscert?: string;

    /**
     * Path to TLS key file (default "/home/dev_user/.docker/key.pem")
     */
    tlskey?: string;

    /**
     * Use TLS and verify the remote
     */
    tlsverify?: boolean;

    /**
     * Print version information and quit
     */
    version?: boolean;

    /**
     * Show help information for a command
     */
    help?: boolean;
}

/**
 * The arguments for a Docker login command.
 */
export interface DockerLoginArgs extends DockerGlobalArgs {
    /**
     * The server to log in to.
     */
    server?: string;
    /**
     * The username to log in with.
     */
    username?: string;
    /**
     * The password to log in with.
     */
    password?: string;
    /**
     * Read the password from stdin.
     */
    passwordStdin?: boolean;
}

/**
 * Logs in to a Docker registry.
 * @param args The arguments for the Docker login command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function login(args: DockerLoginArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["login"],
            argumentNames: ["server"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker logout command.
 */
export interface DockerLogoutArgs extends DockerGlobalArgs {
    /**
     * The server to log out from.
     */
    server?: string;
}

/**
 * Logs out from a Docker registry.
 * @param args The arguments for the Docker logout command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export function logout(args: DockerLogoutArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["logout"],
            argumentNames: ["server"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for a Docker search command.
 */
export interface DockerSearchArgs extends DockerGlobalArgs {
    /**
     * The search term.
     */
    term: string;

    /**
     * Filter output based on conditions provided
     */
    filter?: string;

    /**
     * Pretty-print search using a Go template
     */
    format?: string;

    /**
     * Maximum number of search results.
     */
    limit?: number;

    /**
     * Do not truncate output
     */
    noTrunc?: boolean;
}

/**
 * Create an executable DockerCommand that searches for Docker images.
 * @param args The arguments for the Docker search command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand` that searches for Docker images.
 */
export function search(args: DockerSearchArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["search"],
            argumentNames: ["term"],
            appendArguments: true,
        }),
        options,
    );
}
