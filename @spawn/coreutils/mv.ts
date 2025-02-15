import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("mv")) {
    pathFinder.set("mv", {
        name: "mv",
        envVariable: "RM_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\mv.exe",
        ],
        linux: [
            "/usr/bin/mv",
        ],
    });
}

export class MvCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("mv", args, options);
    }
}

export interface MvArgs extends SplatObject {
    src: string[] | string;
    dest: string;
    backup?: string | boolean;
    b?: boolean 
    debug?: boolean;
    force?: boolean;
    interactive?: boolean;
    noClobber?: boolean;
    noCopy?: boolean;
    stripTrailingSlashes?: boolean;
    suffix?: string;
    targetDirectory?: string;
    noTargetDirectory?: boolean;
    update?: string | boolean;
    verbose?: boolean;
    context?: string;
}


function splatMvArgs(args?: CommandArgs): string[] {
    if (args === undefined) {
        return [];
    }

    if (Array.isArray(args)) {
        return args;
    }

    if (typeof args === "string") {
        return splitArguments(args);
    }

    if (args.src && typeof args.src === "string") {
        args.src = [args.src];
    }

    return splat(args, {
        argumentNames: ["src", "dest"],
        appendArguments: true,
        aliases: {
            "force": "f",
            "interactive": "i",
        }
    })
}

export function mv(args?: MvArgs | string[] | string, options?: CommandOptions): MvCommand {
    return new MvCommand(splatMvArgs(args), options);
}