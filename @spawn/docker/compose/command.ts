import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    type SplatObject,
    SplatSymbols,
} from "@bearz/exec";

pathFinder.set("docker", {
    name: "docker",
    windows: [
        "${ProgramFiles}\\Docker\\Docker\\resources\\bin\\docker.exe",
    ],
    linux: [
        "/usr/local/bin/docker",
    ],
});

/**
 * Represents the global arguments for the Compose command.
 */
export interface ComposeGlobalArgs extends SplatObject {
    ansi?: "never" | "always" | "auto";
    compatibility?: boolean;
    dryRun?: boolean;
    envFile?: string[];
    file?: string[];
    parallel?: number;
    profile?: string[];
    progress?: "auto" | "plain" | "tty" | "quiet";
    projectDirectory?: string;
    projectName?: string;
    help?: boolean;
}

/**
 * Converts the given `SplatObject` into an array of command-line arguments
 * for the `compose` command.
 *
 * @param args - The `SplatObject` containing the arguments.
 * @returns An array of command-line arguments.
 */
export function splatCompose(args: SplatObject): string[] {
    args.splat ??= {};
    const preArgs = [
        "ansi",
        "compatibility",
        "dryRun",
        "envFile",
        "file",
        "parallel",
        "profile",
        "progress",
        "projectDirectory",
        "projectName",
    ];

    const dockerArgs: SplatObject = {
        [SplatSymbols.command]: ["compose"],
        splat: {
            prefix: "--",
        },
    };
    const composeArgs: SplatObject = {
        splat: {
            prefix: "--",
            appendArguments: true,
        },
    };
    for (const key of Object.keys(args)) {
        if (key === "splat") {
            composeArgs.splat = { ...args.splat, ...composeArgs.splat };
            continue;
        }

        if (typeof key === "string" && preArgs.includes(key)) {
            dockerArgs[key] = args[key];
        } else {
            composeArgs[key] = args[key];
        }
    }

    console.log(dockerArgs);
    console.log(composeArgs);
    const params = splat(dockerArgs);
    const after = splat(composeArgs);
    params.push(...after);

    return params;
}

/**
 * Represents a docker command.
 *
 * When using the SplatObject for CommandArgs, the
 * `prefix` and `assign` properties are set to "-" and "=" respectively.
 */
export class DockerComposeCommand extends Command {
    /**
     * Creates a new instance of the `DockerCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("docker", args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            this.args = splatCompose(args);
        }
    }
}

/**
 * Executes the docker compose command line using the DockerCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the DockerCommand class.
 *
 * @example
 * ```typescript
 * import { compose } from "@spawn/docker/compose";
 *
 * await compose("ps --help").run();
 * ```
 */
export function compose(args?: CommandArgs, options?: CommandOptions): DockerComposeCommand {
    return new DockerComposeCommand(args, options);
}
