import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder
} from "@bearz/exec";

if (!pathFinder.has("test")) {
    pathFinder.set("test", {
        name: "test",
        envVariable: "TEST_EXE",
        windows: [
            "${ProgramFiles}\\Git\\usr\\bin\\test.exe",
        ],
        linux: [
            "/usr/bin/test",
        ],
    });
}

export class TestCommand extends Command {
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("test", args, options);
    }
}


export function test(args: string[] | string, options?: CommandOptions): TestCommand {
    if (typeof args === "string") {
        args = [args];
    }

    return new TestCommand(args, options);
}