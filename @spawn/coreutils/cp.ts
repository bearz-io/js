import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("cp")) {
    pathFinder.set("cp", {
        name: "cp",
        envVariable: "CP_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\cp.exe",
        ],
        linux: [
            "/usr/bin/cp",
        ],
    });
}

export class CpCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("cp", args, options);
    }
}

export interface CpArgs extends SplatObject {
    src: string[] | string;
    dest: string;
    archive?: boolean;
    attributesOnly?: boolean;
    backup?: string;
    b: boolean;
    copyContents?: boolean;
    d?: boolean;
    force?: boolean;
    interactive?: boolean;
    H?: boolean;
    link?: boolean;
    deference?: boolean;
    noClobber?: boolean;
    noDereference?: boolean;
    preserve?: string 
    noPreserve?: string;
    parents?: boolean;
    recursive?: boolean;
    reflink?: string;
    removeDestination?: boolean;
    symbolicLink?: boolean;
    suffix?: string;
    targetDirectory?: string;
    noTargetDirectory?: boolean;
    update?: string | boolean;
    verbose?: boolean;
    Z?: boolean;
    context?: string;
}


function splatCpArgs(args?: CommandArgs): string[] {
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
            "recursive": "r",
            "force": "f",
            "interactive": "i",
        }
    })
}

export function cp(args?: CpArgs | string[] | string, options?: CommandOptions): CpCommand {
    return new CpCommand(splatCpArgs(args), options);
}