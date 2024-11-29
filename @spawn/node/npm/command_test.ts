import { skip } from "@bearz/testing";
import { equal, ok } from "@bearz/assert";
import { npm } from "./command.ts";
import { runTest } from "../_test_utils.ts";
import { pathFinder } from "@bearz/exec/path-finder";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noNpm = undefined === pathFinder.findExeSync("npm");

test("@spawn/node/npm - build", skip(noNpm), async () => {
    await runTest(import.meta.url, "npm1", async (dir) => {
        const r = await npm("run build", { cwd: dir, log: (f, a) => console.log(f, a) });
        console.log(r.text());
        equal(r.code, 0, "exit code must be zero");
        ok(r.text().includes("build"), "text must include 'build'");
    });
});
