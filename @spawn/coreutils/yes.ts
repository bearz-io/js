import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
} from "@bearz/exec";

if (!pathFinder.has("yes")) {
    pathFinder.set("yes", {
        name: "yes",
        envVariable: "YES_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\yes.exe",
        ],
        linux: [
            "/usr/bin/yes",
        ],
    });
}

export class YesCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("yes", args, options);
    }
}



export function yes(args?: string[] | string, options?: CommandOptions): YesCommand {
    if (typeof args === "string") {
        args = [args];
    }

    return new YesCommand(args, options);
}