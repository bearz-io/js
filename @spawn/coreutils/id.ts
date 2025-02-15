import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("id")) {
    pathFinder.set("id", {
        name: "id",
        envVariable: "ID_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\id.exe",
        ],
        linux: [
            "/usr/bin/id",
        ],
    });
}

export class IdCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("id", args, options);
    }
}

export interface IdArgs extends SplatObject {
    a?: boolean;
    context?: boolean;
    group?: boolean;
    groups?: boolean;
    name?: boolean;
    real?: boolean;
    user?: boolean;
    zero?: boolean;
}


function splatIdArgs(args?: CommandArgs): string[] {
    if (args === undefined) {
        return [];
    }

    if (Array.isArray(args)) {
        return args;
    }

    if (typeof args === "string") {
        return splitArguments(args);
    }

    if (args.directory && typeof args.directory === "string") {
        args.directory = [args.directory];
    }

    return splat(args, {
        argumentNames: ["directory"],
        appendArguments: true,
        aliases: {
            "context": "Z",
            "group": "g",
            "groups": "G",
            "name": "n",
            "real": "r",
            "user": "u",
            "zero": "z",
        }
    })
}

export function id(args?: IdArgs | string[] | string, options?: CommandOptions): IdCommand {
    return new IdCommand(splatIdArgs(args), options);
}