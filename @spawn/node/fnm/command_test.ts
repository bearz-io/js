import { skip } from "@bearz/testing";
import { equal, ok } from "@bearz/assert";
import { fnm } from "./command.ts";
import { pathFinder } from "@bearz/exec/path-finder";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noFnm = undefined === pathFinder.findExeSync("fnm");

test("@spawn/node/fnm - version", skip(noFnm), async () => {
    const o = await fnm("--version").output();
    equal(o.code, 0, "exit code must be zero");
    ok(o.text().includes("fnm"), "text must include 'fnm'");
});
