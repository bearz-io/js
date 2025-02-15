import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("printf")) {
    pathFinder.set("printf", {
        name: "printf",
        envVariable: "PRINTF_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\printf.exe",
        ],
        linux: [
            "/usr/bin/printf",
        ],
    });
}

export class PrintfCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("printf", args, options);
    }
}

export interface PrintfArgs extends SplatObject {
    format: string;
    arguments?: string[] | string;
    var?: string;
}


function splatPrintfArgs(args?: CommandArgs): string[] {
    if (args === undefined) {
        return [];
    }

    if (Array.isArray(args)) {
        return args;
    }

    if (typeof args === "string") {
        return splitArguments(args);
    }

    if (args.arguments && typeof args.arguments === "string") {
        args.arguments = [args.arguments];
    }

    return splat(args, {
        argumentNames: ["format", "arguments"],
        appendArguments: true,
    })
}

export function printf(args?: PrintfArgs | string[] | string, options?: CommandOptions): PrintfCommand {
    return new PrintfCommand(splatPrintfArgs(args), options);
}