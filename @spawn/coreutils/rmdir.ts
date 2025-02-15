import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("rmdir")) {
    pathFinder.set("rmdir", {
        name: "rmdir",
        envVariable: "RMDIR_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\rmdir.exe",
        ],
        linux: [
            "/usr/bin/rmdir",
        ],
    });
}

export class RmDirCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("rmdir", args, options);
    }
}

export interface RmDirArgs extends SplatObject {
    directory: string[] | string;
    verbose?: boolean;
    parents?: boolean;
    ignoreFailOnNonEmpty?: boolean;
}


function splatRmDirArgs(args?: CommandArgs): string[] {
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
            "parents": "p",
            "verbose": "v",
        }
    })
}

export function rmdir(args?: RmDirArgs | string[] | string, options?: CommandOptions): RmDirCommand {
    return new RmDirCommand(splatRmDirArgs(args), options);
}