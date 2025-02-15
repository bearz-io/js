import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("pwd")) {
    pathFinder.set("pwd", {
        name: "pwd",
        envVariable: "PWD_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\pwd.exe",
        ],
        linux: [
            "/usr/bin/pwd",
        ],
    });
}

export class PwdCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("pwd", args, options);
    }
}

export interface PwdArgs extends SplatObject {
    logical?: boolean;
    physical?: boolean;
}


function splatPwdArgs(args?: CommandArgs): string[] {
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
        aliases: {
            "logical": "L",
            "physical": "P",
        }
    })
}

export function pwd(args?: PwdArgs | string[] | string, options?: CommandOptions): PwdCommand {
    return new PwdCommand(splatPwdArgs(args), options);
}