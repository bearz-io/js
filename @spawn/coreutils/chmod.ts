import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("chmod")) {
    pathFinder.set("chmod", {
        name: "chmod",
        envVariable: "CHMOD_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\chmod.exe",
        ],
        linux: [
            "/usr/bin/chmod",
        ],
    });
}

export class ChmodCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("chmod", args, options);
    }
}

export interface ChmodArgs extends SplatObject {
    file: string[] | string;
    mode: Array<string | number> | string | number;
    changes?: boolean;
    force?: boolean;
    verbose?: boolean;
    noPreserveRoot?: boolean;
    preserveRoot?: boolean;
    reference?: string;
    recursive?: boolean;
}


function splatChmodArgs(args?: CommandArgs): string[] {
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

    if (Array.isArray(args.mode)) {
        args.mode = args.mode.map((mode) => {
            if (typeof mode === "number") {
                return mode.toString(8);
            }
            return mode;
        });
    }

    if (typeof args.mode === "number") {
        args.mode = args.mode.toString(8);
    }

    return splat(args, {
        argumentNames: ["file"],
        appendArguments: true,
        aliases: {
           "changes": "c",
           "force": "f",
           "verbose": "v",
           "recursive": "R",
        }
    })
}

export function chmod(args?: ChmodArgs | string[], options?: CommandOptions): ChmodCommand {
    return new ChmodCommand(splatChmodArgs(args), options);
}