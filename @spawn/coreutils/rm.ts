import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    type ShellCommandOptions,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("rm")) {
    pathFinder.set("rm", {
        name: "rm",
        envVariable: "RM_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\rm.exe",
        ],
        linux: [
            "/usr/bin/rm",
        ],
    });
}

export class RmCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("rm", args, options);
    }
}

export interface RmArgs extends SplatObject {
    file: string[] | string;
    force?: boolean;
    interactive?: boolean;
    recursive?: boolean;
    dir?: boolean;
    verbose?: boolean;
}


function splatRmArgs(args?: CommandArgs): string[] {
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
            "force": "f",
            "interactive": "i",
            "recursive": "r",
            "dir": "d",
            "verbose": "v",
        }
    })
}

export function rm(args?: RmArgs | string[] | string, options?: ShellCommandOptions): RmCommand {
    return new RmCommand(splatRmArgs(args), options);
}