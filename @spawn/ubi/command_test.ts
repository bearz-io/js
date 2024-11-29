import { skip } from "@bearz/testing";
import { equal, ok } from "@bearz/assert";
import { ubi } from "./command.ts";
import { pathFinder } from "@bearz/exec/path-finder";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noUbi = undefined === pathFinder.findExeSync("ubi");

test("@spawn/ubi - version", skip(noUbi), async () => {
    const result = await ubi("--version");
    equal(result.code, 0);
    ok(result.text().startsWith("ubi"));
});
