import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
} from "@bearz/exec";

if (!pathFinder.has("unlink")) {
    pathFinder.set("unlink", {
        name: "unlink",
        envVariable: "RMDIR_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\unlink.exe",
        ],
        linux: [
            "/usr/bin/unlink",
        ],
    });
}

export class UnlinkCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("unlink", args, options);
    }
}





export function unlink(args?: string[] | string, options?: CommandOptions): UnlinkCommand {
    if (typeof args === "string") {
        args = [args];
    }

    return new UnlinkCommand(args, options);
}