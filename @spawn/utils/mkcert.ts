import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("mkcert")) {
    pathFinder.set("mkcert", {
        name: "mkcert",
        envVariable: "MKCERT_EXE",
        windows: [
        ],
        linux: [
            "/usr/bin/mkcert",
        ],
    });
}

export class MkcertCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("mkcert", args, options);
    }
}

export interface MkcertArgs extends SplatObject {
    domains: string[] | string;
    install?: boolean;
    uninstall?: boolean;
    caroot?: boolean 
    client?: boolean;
    ecdsa?: boolean;
    csr?: string;
    certFile?: string;
    keyFile?: string;
    p12File?: string;
    pkcs12?: boolean;
}


function splatMkcertArgs(args?: CommandArgs): string[] {
    if (args === undefined) {
        return [];
    }

    if (Array.isArray(args)) {
        return args;
    }

    if (typeof args === "string") {
        return splitArguments(args);
    }

    if (args.caroot) {
        return ["-CAROOT"];
    }

    if (args.install) {
        return ["-install"];
    }

    if (args.uninstall) {
        return ["-uninstall"];
    }

    const splat : string[] = [];
    if (args.pkcs12) {
        splat.push("-pkcs12");
    }

    if (args.client) {
        splat.push("-client");
    }

    if (args.ecdsa) {
        splat.push("-ecdsa");
    }

    if (args.csr) {
        splat.push("-csr", args.csr as string);
    }

    if (args.certFile) {
        splat.push("-cert-file", args.certFile as string);
    }

    if (args.keyFile) {
        splat.push("-key-file", args.keyFile as string);
    }

    if (args.p12File) {
        splat.push("-p12-file", args.p12File as string);
    }

    if (!args.domains) {
        throw new Error("The domains argument is required.");
    }

    const domains : string[] = typeof args.domains === "string" ? [args.domains] : args.domains as string[];
    splat.push(...domains);

    return splat;
}

export function mkcert(args?: MkcertArgs | string[] | string, options?: CommandOptions): MkcertCommand {
    return new MkcertCommand(splatMkcertArgs(args), options);
}