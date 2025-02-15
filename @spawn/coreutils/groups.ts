import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
} from "@bearz/exec";

if (!pathFinder.has("groups")) {
    pathFinder.set("groups", {
        name: "groups",
        envVariable: "GROUPS_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\groups.exe",
        ],
        linux: [
            "/usr/bin/groups",
        ],
    });
}

export class GroupsCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("groups", args, options);
    }
}


export function groups(options?: CommandOptions): GroupsCommand {
    return new GroupsCommand([], options);
}