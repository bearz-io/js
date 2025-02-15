import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("ln")) {
    pathFinder.set("ln", {
        name: "ln",
        envVariable: "LN_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\ln.exe",
        ],
        linux: [
            "/usr/bin/ln",
        ],
    });
}

export class LnCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("ln", args, options);
    }
}

export interface LnArgs extends SplatObject {
    src: string[] | string;
    dest?: string
    backup?: string | boolean;
    b?: boolean;
    directory?: string[] | string;
    force?: boolean;
    interactive?: boolean;
    logical?: boolean;
    noDereference?: boolean;
    physical?: boolean;
    relative?: boolean;
    symbolic?: boolean;
    suffix?: string;
    targetDirectory?: string;
    noTargetDirectory?: boolean;
    verbose?: boolean;
}


function splatLnArgs(args?: CommandArgs): string[] {
    if (args === undefined) {
        return [];
    }

    if (Array.isArray(args)) {
        return args;
    }

    if (typeof args === "string") {
        return splitArguments(args);
    }

    if (args.directory && typeof args.directory === "string") {
        args.directory = [args.directory];
    }

    return splat(args, {
        argumentNames: ["src", "dest"],
        appendArguments: true,
        aliases: {
            "directory": "d",
            "force": "f",
            "interactive": "i",
            "noDereference": "n",
            "physical": "P",
            "relative": "r",
            "symbolic": "s",
            "suffix": "S",
            "targetDirectory": "t",
            "noTargetDirectory": "T",
            "verbose": "v",
        }
    })
}

export function ln(args?: LnArgs | string[] | string, options?: CommandOptions): LnCommand {
    return new LnCommand(splatLnArgs(args), options);
}