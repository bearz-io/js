import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("chown")) {
    pathFinder.set("chown", {
        name: "chown",
        envVariable: "CHOWN_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\chown.exe",
        ],
        linux: [
            "/usr/bin/chown",
        ],
    });
}

export class ChownCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("chown", args, options);
    }
}

export interface ChownArgs extends SplatObject {
    file: string[] | string;
    owner?: string;
    group?: string;
    changes?: boolean;
    quiet?: boolean;
    verbose?: boolean;
    deference?: boolean;
    noDereference?: boolean;
    from?: string;
    noPreserveRoot?: boolean;
    preserveRoot?: boolean;
    reference?: string;
    recursive?: boolean;
    H?: boolean;
    L?: boolean;
    P?: boolean;
}


function splatChownArgs(args?: CommandArgs): string[] {
    if (args === undefined) {
        return [];
    }

    if (Array.isArray(args)) {
        return args;
    }

    if (typeof args === "string") {
        return splitArguments(args);
    }

    if (args.owner && args.group) {
        args.owner = `${args.owner}:${args.group}`;
        delete args.group;
    }

    return splat(args, {
        argumentNames: ["owner", "file"],
        appendArguments: true,
        aliases: {
           "changes": "c",
           "quiet": "f",
           "verbose": "v",
           "deference": "h",
           "recursive": "R",
        }
    })
}

export function chown(args?: ChownArgs | string[], options?: CommandOptions): ChownCommand {
    return new ChownCommand(splatChownArgs(args), options);
}