import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("grep")) {
    pathFinder.set("grep", {
        name: "grep",
        envVariable: "GREP_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\grep.exe",
        ],
        linux: [
            "/usr/bin/grep",
        ],
    });
}

export class GrepCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("grep", args, options);
    }
}

export interface GrepArgs extends SplatObject {
    patterns: string[] | string;
    src?: string[] | string;
    extendedRegexp?: boolean;
    fixedStrings?: boolean;
    basicRegexp?: boolean;
    perlRegexp?: boolean;
    regexp?: string 
    file?: string[] | string;
    ignoreCase?: boolean;
    noIgnoreCase?: boolean;
    wordRegexp?: boolean;
    lineRegexp?: boolean;
    nullData?: boolean;
    noMessages?: boolean;
    lineNumber?: boolean;
    lineBuffered?: boolean;
    recursive?: boolean;
    directories?: 'skip' | 'read' | 'recurse';
    devices?: 'skip' | 'read'
    include?: string;
    exclude?: string;
    excludeFrom?: string;
    excludeDir?: string;
    color?: 'auto' | 'always' | 'never';
    null?: boolean;
}


function splatGrepArgs(args?: CommandArgs): string[] {
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
        argumentNames: ["patterns", "src"],
        appendArguments: true
    })
}

export function grep(args?: GrepArgs | string[] | string, options?: CommandOptions): GrepCommand {
    return new GrepCommand(splatGrepArgs(args), options);
}