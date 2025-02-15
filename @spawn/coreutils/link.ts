import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("link")) {
    pathFinder.set("link", {
        name: "link",
        envVariable: "LINK_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\link.exe",
        ],
        linux: [
            "/usr/bin/link",
        ],
    });
}

export class LinkCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("link", args, options);
    }
}



export function link(args?: string[] | string, options?: CommandOptions): LinkCommand {
    if (typeof args === "string") {
        args = [args];
    }

    return new LinkCommand(args, options);
}