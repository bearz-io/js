import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("echo")) {
    pathFinder.set("echo", {
        name: "echo",
        envVariable: "ECHO_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\echo.exe",
        ],
        linux: [
            "/usr/bin/echo",
        ],
    });
}

export class EchoCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("echo", args, options);
    }
}

export interface EchoArgs extends SplatObject {
    text: string[] | string;
    noNewline?: boolean;
    enableEscape?: boolean;
}


function splatEchoArgs(args?: CommandArgs): string[] {
    if (args === undefined) {
        return [];
    }

    if (Array.isArray(args)) {
        return args;
    }

    if (typeof args === "string") {
        return splitArguments(args);
    }

    if (args.text && typeof args.text === "string") {
        args.text = [args.text];
    }

    return splat(args, {
        argumentNames: ["text"],
        appendArguments: true,
        aliases: {
            "noNewline": "n",
            "enableEscape": "e"
        }
    })
}

export function echo(args?: EchoArgs | string[] | string, options?: CommandOptions): EchoCommand {
    return new EchoCommand(splatEchoArgs(args), options);
}