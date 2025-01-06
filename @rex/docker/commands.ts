import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    type SplatObject,
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
        super("docker", args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            args.splat ??= {};
            args.splat.prefix = "--";
        }
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

export function listNetworks(): DockerCommand {
    return docker(["network", "ls"]);
}

export async function listNetworksNames(): Promise<string[]> {
    const cmd = listNetworks();
    const args = cmd.toArgs();
    args.push("--format", "{{.Name}}");
    if (args[0] === "docker") {
        args.shift();
    }

    cmd.withArgs(args);

    const o = await cmd.output();

    const availableNetworks = o.text()
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x.length > 0);

    return availableNetworks;
}

export interface NetworkCreateParams {
    name: string;
    context?: string;
    driver?: "bridge" | "overlay" | "macvlan" | "none" | "null" | "host";
    attachable?: boolean;
    ingress?: boolean;
    subnet?: string;
    gateway?: string;
    opt?: Record<string, string>;
}

export function createNetwork(params: NetworkCreateParams): DockerCommand {
    const splat = ["network", "create", "-d", params.driver ?? "bridge"];

    if (params.context) {
        splat.unshift("--context", params.context);
    }

    if (params.attachable) {
        splat.push("--attachable");
    }

    if (params.ingress) {
        splat.push("--ingress");
    }

    if (params.subnet) {
        splat.push("--subnet", params.subnet);
    }

    if (params.gateway) {
        splat.push("--gateway", params.gateway);
    }

    if (params.opt) {
        for (const key in params.opt) {
            splat.push("--opt", `${key}=${params.opt[key]}`);
        }
    }

    splat.push(params.name);

    return docker(splat);
}

export function removeNetwork(name: string): DockerCommand {
    return docker(["network", "rm", name]);
}

export function inspectNetwork(name: string): DockerCommand {
    return docker(["network", "inspect", name]);
}

export interface DockerSshContextParams {
    name: string;
    host: string;
    user: string;
}

export function createSshContext(params: DockerSshContextParams): DockerCommand {
    return docker(["context", "create", params.name, "--docker", `${params.user}@${params.host}`]);
}

export function listContexts(): DockerCommand {
    return docker(["context", "ls", "--format", "'{{.Name}}'"]);
}

export async function listContextsNames(): Promise<string[]> {
    const res = await listContexts().output();
    return res.lines().map((x) => x.trim()).filter((x) => x.length > 0);
}

export function removeContext(name: string): DockerCommand {
    return docker(["context", "rm", name]);
}

export function useContext(name: string): DockerCommand {
    return docker(["context", "use", name]);
}
