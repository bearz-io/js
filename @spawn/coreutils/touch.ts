import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("touch")) {
    pathFinder.set("touch", {
        name: "touch",
        envVariable: "TOUCH_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\touch.exe",
        ],
        linux: [
            "/usr/bin/touch",
        ],
    });
}

export class TouchCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("touch", args, options);
    }
}

export interface TouchArgs extends SplatObject {
    file: string[] | string;
    atime?: boolean
    mtime?: boolean
    date?: string
    noCreate?: boolean
    noDereference?: boolean
    reference?: string
}

function splatTouchArgs(args?: CommandArgs): string[] {
    if (args === undefined) {
        return [];
    }

    if (Array.isArray(args)) {
        return args;
    }

    if (typeof args === "string") {
        return [args];
    }

    if (args.file && typeof args.file === "string") {
        args.file = [args.file];
    }

    return splat(args, {
        argumentNames: ["file"],
        appendArguments: true,
        aliases: {
            "atime": "a",
            "mtime": "m",
            "noCreate": "c",
            "noDereference": "h",
            "reference": "r",
        }
    })
}

export function touch(args?: TouchArgs | string[] | string, options?: CommandOptions): TouchCommand {
    return new TouchCommand(splatTouchArgs(args), options);
}