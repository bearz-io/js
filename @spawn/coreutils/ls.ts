import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("ls")) {
    pathFinder.set("ls", {
        name: "ls",
        envVariable: "LS_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\ls.exe",
        ],
        linux: [
            "/usr/bin/ls",
        ],
    });
}

export class LsCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("ls", args, options);
    }
}

export interface LsArgs extends SplatObject {
    file: string[] | string;
    all?: boolean;
    almostAll?: boolean;
    author?: boolean;
    escape?: boolean;
    blockSize?: string;
    ignoreBackups?: boolean;
    c?: boolean;
    C?: boolean;
    color?: boolean | 'always' | 'auto' | 'never';
    context?: boolean;
    deference?: boolean;
    directory?: string[] | string;
    dired?: boolean;
    f?: boolean;
    classify?: string | boolean;
    fileType: boolean;
    format?: string;
    fullTime?: boolean;
    g?: boolean;
    groupDirectoriesFirst?: boolean;
    noGroup?: boolean;
    humanReadable?: boolean;
    si?: boolean;
    deferenceCommandLine?: boolean;
    hide?: string;
    hyperlink?: string | boolean;
    indicatorStyle?: string;
    inode?: boolean;
    ignore?: string;
    kibibytes?: boolean;
    l?: boolean;
    m?: boolean;
    numericUidGid?: boolean;
    literal?: boolean;
    o?: boolean;
    hideControlChars?: boolean;
    showControlChars?: boolean;
    quoteName?: boolean;
    quotingStyle?: 'literal' | 'shell' | 'shell-always' | 'shell-escape' | 'c' | 'escape' | 'locale' | 'c-maybe';
    reverse?: boolean;
    recursive?: boolean;
    size?: boolean;
    S?: boolean;
    sort?: string;
    time?: string;
    t?: boolean;
    tabsize?: number;
    u?: boolean;
    U?: boolean;
    v?: boolean;
    width?: number;
    x?: boolean;
    X?: boolean;
    zero?: boolean;
}


function splatLsArgs(args?: CommandArgs): string[] {
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
            "all": "a",
            "almostAll": "A",
            "escape": "b",
            "size": "s",
            "quoteName": "Q",
            "recursive": "R",
            "reverse": "r",
            "tabsize": "T",
            "width": "w",
        }
    })
}

export function ls(args?: LsArgs | string[] | string, options?: CommandOptions): LsCommand {
    return new LsCommand(splatLsArgs(args), options);
}