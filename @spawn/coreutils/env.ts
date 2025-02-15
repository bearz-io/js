import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("env")) {
    pathFinder.set("env", {
        name: "env",
        envVariable: "ENV_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\env.exe",
        ],
        linux: [
            "/usr/bin/env",
        ],
    });
}

export class EnvCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("env", args, options);
    }
}

export interface EnvArgs extends SplatObject {
    cmd: string[] | string;
    env: Record<string, string> | Array<string>;
    ignoreEnvironment?: boolean;
    null?: boolean;
    unset?: string[] | string;
    chdir?: string;
    splitString?: string;
    blockSignal?: string;
    ignoreSignal?: string;
}


function splatEnvArgs(args?: CommandArgs): string[] {
    if (args === undefined) {
        return [];
    }

    if (Array.isArray(args)) {
        return args;
    }

    if (typeof args === "string") {
        return splitArguments(args);
    }

    if (!Array.isArray(args.env)) {
        args.env = Object.entries(args.env as Record<string, string>).map(([key, value]) => `${key}=${value}`);
    }

    if (args.cmd && typeof args.cmd === "string") {
        args.cmd = [args.cmd];
    }

    return splat(args, {
        argumentNames: ["env", "cmd"],
        appendArguments: true,
        aliases: {
            "ignoreEnvironment": "i",
            "null": "0",
            "chdir": "C",
        }
    })
}

export function env(args?: EnvArgs | string[] | string, options?: CommandOptions): EnvCommand {
    return new EnvCommand(splatEnvArgs(args), options);
}