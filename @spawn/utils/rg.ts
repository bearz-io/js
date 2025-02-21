import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
} from "@bearz/exec";

if (!pathFinder.has("rg")) {
    pathFinder.set("rg", {
        name: "rg",
        envVariable: "RG_EXE",
        windows: [],
        linux: [
            "/usr/bin/rg",
            "/usr/local/bin/rg",
        ],
    });
}

export class RgCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("rg", args, options);
    }
}


export function rg(args?: CommandArgs | string[] | string, options?: CommandOptions): RgCommand {
    return new RgCommand(args, options);
}