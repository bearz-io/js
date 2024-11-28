import { skip } from "@bearz/testing";
import { equal, ok } from "@bearz/assert";
import { yarn } from "./command.ts";
import { pathFinder } from "@bearz/exec/path-finder";
import { runTest } from "../_test_utils.ts";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noYarn = undefined === pathFinder.findExeSync("yarn");

test("@spawn/nodeyarn - build", skip(noYarn), async () => {
    await runTest(import.meta.url, "yarn1", async (dir) => {
        const r = await yarn("run build", { cwd: dir });
        equal(r.code, 0, "exit code must be zero");
        ok(r.text().includes("build"), "text must include 'build'");
    });
});
