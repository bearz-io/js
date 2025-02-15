import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("realpath")) {
    pathFinder.set("realpath", {
        name: "realpath",
        envVariable: "RMDIR_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\realpath.exe",
        ],
        linux: [
            "/usr/bin/realpath",
        ],
    });
}

export class RealpathCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("realpath", args, options);
    }
}

export interface RealpathArgs extends SplatObject {
    file: string[] | string;
    canonicalizeExisting?: boolean;
    canonicalizeMissing?: boolean;
    logical?: boolean;
    physical?: boolean;
    quiet?: boolean;
    relativeTo?: string;
    relativeBase?: string;
    noSymlinks?: boolean;
    zero?: boolean;
}


function splatRealpathArgs(args?: CommandArgs): string[] {
    if (args === undefined) {
        return [];
    }

    if (Array.isArray(args)) {
        return args;
    }

    if (typeof args === "string") {
        return splitArguments(args);
    }

    if (args.file && typeof args.file === "string") {
        args.file = [args.file];
    }

    return splat(args, {
        argumentNames: ["file"],
        appendArguments: true,
        aliases: {
            "canonicalizeExisting": "e",
            "canonicalizeMissing": "m",
            "logical": "L",
            "physical": "P",
            "quiet": "q",
            "relativeTo": "r",
            "relativeBase": "b",
            "noSymlinks": "s",
            "zero": "z",
        }
    })
}

export function realpath(args?: RealpathArgs | string[] | string, options?: CommandOptions): RealpathCommand {
    return new RealpathCommand(splatRealpathArgs(args), options);
}