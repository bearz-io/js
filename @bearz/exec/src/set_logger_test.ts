import { equal, ok } from "@bearz/assert";
import { setLogger } from "./set_logger.ts";
import { cmd } from "./command.ts";
import { pathFinder } from "./path_finder.ts";

const test = Deno.test;
const hasExe = pathFinder.findExeSync("echo") !== undefined;

test("exec::setLogger", { ignore: !hasExe }, async () => {
    let fileName = "";
    let args2: undefined | string[] = [];
    setLogger((file, args) => {
        fileName = file;
        args2 = args;
    });
    try {
        await cmd("echo", ["test"]);
        ok(fileName.endsWith("echo") || fileName.endsWith("echo.exe"));
        equal(args2, ["test"]);
    } finally {
        setLogger(undefined);
    }
});
