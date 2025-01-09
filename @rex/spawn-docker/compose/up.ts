import type { CommandOptions } from "@bearz/exec";
import { type ComposeGlobalArgs, DockerComposeCommand } from "./command.ts";

/**
 * Represents the arguments for the "up" command in the Docker Compose CLI.
 */
export interface UpArgs extends ComposeGlobalArgs {
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
export function up(args: UpArgs, options?: CommandOptions): DockerComposeCommand {
    args.splat ??= {};
    args.splat.argumentNames = ["services"];
    args.splat.command = ["up"];

    return new DockerComposeCommand(args, options);
}
