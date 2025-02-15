import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("cat")) {
    pathFinder.set("cat", {
        name: "cat",
        envVariable: "CAT_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\cat.exe",
        ],
        linux: [
            "/usr/bin/cat",
        ],
    });
}

export class CatCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("cat", args, options);
    }
}

export interface CatArgs extends SplatObject {
    file: string[] | string;
    showAll?: boolean;
    numberNonblank?: boolean;
    e?: boolean;
    showEnds?: boolean;
    number?: boolean;
    squeezeBlank?: boolean;
    showTabs?: boolean;
    t?: boolean;
    showNonprinting?: boolean;
    ignoreFailOnNonEmpty?: boolean;
}


function splatCatArgs(args?: CommandArgs): string[] {
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
        argumentNames: ["directory"],
        appendArguments: true,
        aliases: {
            "showAll": "A",
            "numberNonblank": "b",
            "showEnds": "e",
            "number": "n",
            "squeezeBlank": "s",
            "showTabs": "T",
            "showNonprinting": "v",
        }
    })
}

export function cat(args?: CatArgs | string[] | string, options?: CommandOptions): CatCommand {
    return new CatCommand(splatCatArgs(args), options);
}