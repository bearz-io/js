import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    splat,
    splitArguments,
    type SplatObject,
} from "@bearz/exec";

if (!pathFinder.has("procs")) {
    pathFinder.set("procs", {
        name: "procs",
        envVariable: "PROCS_EXE",
        windows: [
        ],
        linux: [
            "/usr/bin/procs",
            "/usr/local/bin/procs",
        ],
    });
}

export class ProcsCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("procs", args, options);
    }
}

export function procs(args?: CommandArgs | string[] | string, options?: CommandOptions): ProcsCommand {
    return new ProcsCommand(args, options);
}