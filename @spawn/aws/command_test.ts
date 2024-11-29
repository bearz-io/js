import { skip } from "@bearz/testing";
import { ok } from "@bearz/assert";
import { aws } from "./command.ts";
import { pathFinder } from "@bearz/exec/path-finder";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noAws = undefined === await pathFinder.findExe("aws");

test("aws", skip(noAws), async () => {
    const r = await aws("help");
    ok(r.code === 0);
});
