import { skip } from "@bearz/testing";
import { ok } from "@bearz/assert";
import { curl } from "./command.ts";
import { pathFinder } from "@bearz/exec/path-finder";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noCurl = undefined === await pathFinder.findExe("curl");

test("curl", skip(noCurl), async () => {
    const r = await curl("-h");
    ok(r.code === 0);
});
