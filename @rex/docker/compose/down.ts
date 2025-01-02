import type { CommandOptions } from "@bearz/exec";
import { type ComposeGlobalArgs, DockerComposeCommand, splatCompose } from "./command.ts";

/**
 * Represents the arguments for the `down` command in Docker Compose.
 */
export interface DownArgs extends ComposeGlobalArgs {
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

export function splatDownArgs(args: DownArgs): string[] {
    args.splat ??= {};
    args.splat.command = ["down"];
    args.splat.arguments = ["services"];
    args.splat.appendArguments = true;

    return splatCompose(args);
}

/**
 * Stops and removes the containers, networks, and volumes defined in the Docker Compose file.
 *
 * @param args - The arguments for the `down` command.
 * @param options - The options for the `down` command.
 * @returns A `DockerComposeCommand` instance representing the `down` command.
 */
export function down(args: DownArgs, options?: CommandOptions): DockerComposeCommand {
    const params = splatDownArgs(args);

    return new DockerComposeCommand(params, options);
}
