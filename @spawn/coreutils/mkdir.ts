import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("mkdir")) {
    pathFinder.set("mkdir", {
        name: "mkdir",
        envVariable: "MKDIR_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\mkdir.exe",
        ],
        linux: [
            "/usr/bin/mkdir",
        ],
    });
}

export class MkdirCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("mkdir", args, options);
    }
}

export interface MkdirArgs extends SplatObject {
    directory: string[] | string;
    mode?: string | number;
    parents?: boolean;
    verbose?: boolean;
    Z?: boolean;
    context?: string;
}


function splatMkdirArgs(args?: CommandArgs): string[] {
    if (args === undefined) {
        return [];
    }

    if (Array.isArray(args)) {
        return args;
    }

    if (typeof args === "string") {
        return [args];
    }

    if (args.directory && typeof args.directory === "string") {
        args.directory = [args.directory];
    }

    if (typeof args.mode === "number") {
        args.mode = args.mode.toString(8);
    }

    return splat(args, {
        argumentNames: ["directory"],
        appendArguments: true,
        aliases: {
            "parents": "p",
            "mode": "m",
            "verbose": "v",
        }
    })
}

export function mkdir(args?: MkdirArgs | string[] | string, options?: CommandOptions): MkdirCommand {
    return new MkdirCommand(splatMkdirArgs(args), options);
}