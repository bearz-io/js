import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("awk")) {
    pathFinder.set("awk", {
        name: "awk",
        envVariable: "AWK_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\awk.exe",
        ],
        linux: [
            "/usr/bin/awk",
        ],
    });
}

export class AwkCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("awk", args, options);
    }
}

export interface AwkArgs extends SplatObject {
    glob: string 
    expression: string
    file?: string 
    fieldSeparator?: string
    assign?: string
    charactersAsBytes?: boolean
    traditional?: boolean
    dumpVariables?: boolean
    debug?: string | boolean
    source?: string
    exec?: string
    genPot?: boolean
    include?: string
    trace?: boolean 
    load?: string
    lint?: 'fatal' | 'invalid' | 'no-ext'
    bignum?: boolean
    profile?: string | boolean
    posix?: boolean
    reInterval?: boolean
    optimize?: boolean
    noOptimize?: boolean
    sandbox?: boolean
}


function splatAwkArgs(args?: CommandArgs): string[] {
    if (args === undefined) {
        return [];
    }

    if (Array.isArray(args)) {
        return args;
    }

    if (typeof args === "string") {
        return splitArguments(args);
    }

    return splat(args, {
        argumentNames: ["expression", "glob"],
        appendArguments: true,
    })
}

export function awk(args?: AwkArgs | string[] | string, options?: CommandOptions): AwkCommand {
    return new AwkCommand(splatAwkArgs(args), options);
}