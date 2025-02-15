import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("mktemp")) {
    pathFinder.set("mktemp", {
        name: "mktemp",
        envVariable: "MKTEMP_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\mktemp.exe",
        ],
        linux: [
            "/usr/bin/mktemp",
        ],
    });
}

export class MkTempCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("mktemp", args, options);
    }
}

export interface MkTempArgs extends SplatObject {
    template?: string;
    dryRun?: boolean;
    quiet?: boolean;
    suffix?: string;
    tmpdir?: string;
}


function splatMkTempArgs(args?: CommandArgs): string[] {
    if (args === undefined) {
        return [];
    }

    if (Array.isArray(args)) {
        return args;
    }

    if (typeof args === "string") {
        return [args];
    }

    if (args.template && typeof args.template === "string") {
        args.template = [args.template];
    }

    return splat(args, {
        argumentNames: ["template"],
        appendArguments: true,
        aliases: {
            "directory": "d",
            "quiet": "q",
            "dryRun": "u",
        }
    })
}

export function mktemp(args?: MkTempArgs | string[] | string, options?: CommandOptions): MkTempCommand {
    return new MkTempCommand(splatMkTempArgs(args), options);
}