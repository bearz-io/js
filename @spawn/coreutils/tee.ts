import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    type ShellCommandOptions,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("tee")) {
    pathFinder.set("tee", {
        name: "tee",
        envVariable: "TEE_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\tee.exe",
        ],
        linux: [
            "/usr/bin/tee",
        ],
    });
}

export class TeeCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("tee", args, options);
    }
}

export interface TeeArgs extends SplatObject {
    file: string[] | string;
    append?: boolean;
    ignoreInterrupts?: boolean;
    pipes?: boolean;
    outputError?: 'warn' | 'warn-nopipe' | 'exit' | 'exit-nopipe' | boolean
}


function splatTeeArgs(args?: CommandArgs): string[] {
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
            "append": "a",
            "ignoreInterrupts": "i",
            "pipes": "p",
        }
    })
}

export function tee(args?: TeeArgs | string[] | string, options?: ShellCommandOptions): TeeCommand {
    return new TeeCommand(splatTeeArgs(args), options);
}