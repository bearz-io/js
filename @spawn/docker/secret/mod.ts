import { type CommandOptions, splat } from "@bearz/exec";
import { docker, type DockerCommand, type DockerGlobalArgs } from "../command.ts";

/**
 * The arguments for the Docker secret create command.
 */
export interface DockerSecretCreateArgs extends DockerGlobalArgs {
    /**
     * The name of the secret.
     */
    secret: string;

    /**
     * The file to read the secret from. If not used, the secret is read from stdin.
     */
    file?: string;

    /**
     * The driver to use for the secret.
     */
    driver?: string;

    /**
     * The labels to apply to the secret.
     */
    label?: string[];

    /**
     * The template driver to use for the secret.
     */
    templateDriver?: string;
}

/**
 * Creates an executable DockerCommand that creates a Docker secret.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns `DockerCommand` that creates a Docker secret.
 */
export function create(args: DockerSecretCreateArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["secret", "create"],
            argumentNames: ["secret", "file"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker secret inspect command.
 */
export interface DockerSecretInspectArgs extends DockerGlobalArgs {
    /**
     * The name of the secret.
     */
    secret: string[];

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
 * Creates an executable DockerCommand that inspects a Docker secret.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns `DockerCommand` that inspects a Docker secret.
 */
export function inspect(args: DockerSecretInspectArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["secret", "inspect"],
            argumentNames: ["secret"],
            appendArguments: true,
        }),
        options,
    );
}

/**
 * The arguments for the Docker secret ls command.
 */
export interface DockerSecretLsArgs extends DockerGlobalArgs {
    /**
     * Filter output based on conditions provided.
     */
    filter?: string;

    /**
     * Format the output using the given Go template.
     */
    format?: "json" | "template" | string;

    /**
     * Only display IDs.
     */
    quiet?: boolean;
}

/**
 * Creates an executable DockerCommand that lists Docker secrets.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns `DockerCommand` that lists Docker secrets.
 */
export function ls(args: DockerSecretLsArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["secret", "ls"],
        }),
        options,
    );
}

/**
 * The arguments for the Docker secret rm command.
 */
export interface DockerSecretRmArgs extends DockerGlobalArgs {
    /**
     * The name of the secret.
     */
    secret: string[];
}

/**
 * Creates an executable DockerCommand that removes Docker secrets.
 * @param args The arguments for the command.
 * @param options The options for the command.
 * @returns `DockerCommand` that removes Docker secrets.
 */
export function rm(args: DockerSecretRmArgs, options?: CommandOptions): DockerCommand {
    return docker(
        splat(args, {
            command: ["secret", "rm"],
            argumentNames: ["secret"],
            appendArguments: true,
        }),
        options,
    );
}
