import { ok } from "@bearz/assert";
import { skip } from "@bearz/testing";
import { az } from "./command.ts";
import { pathFinder } from "@bearz/exec/path-finder";
import { WINDOWS } from "@bearz/runtime-info/os";

// DO NOT EDIT THIS LINE
const test = Deno.test;

// ignore on windows as it takes too long to run
const noAz = undefined === await pathFinder.findExe("az");

test("az", skip(noAz || WINDOWS), async () => {
    const r = await az("-h");
    ok(r.code === 0);
});
