import { skip } from "@bearz/testing";
import { equal, ok } from "@bearz/assert";
import { pnpm } from "./command.ts";

import { pathFinder } from "@bearz/exec/path-finder";
import { runTest } from "../_test_utils.ts";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noPnpm = pathFinder.findExeSync("pnpm") !== undefined;

test("@spawn/node/pnpm - build", skip(noPnpm), async () => {
    await runTest(import.meta.url, "pnpm1", async (dir) => {
        const r = await pnpm("run build", { cwd: dir });
        console.log(r.text());
        equal(r.code, 0, "exit code must be zero");
        ok(r.text().includes("build"), "text must include 'build'");
    });
});
