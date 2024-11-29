import { equal } from "@bearz/assert";
import { skip } from "@bearz/testing";
import { npx } from "./command.ts";
import { runTest } from "../_test_utils.ts";
import { pathFinder } from "@bearz/exec/path-finder";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noNpx = undefined === pathFinder.findExeSync("npx") !== undefined;

test("@spawn/node/npx - cowsay", skip(noNpx), async () => {
    await runTest(import.meta.url, "npx1", async (dir) => {
        const result = await npx("cowsay hello", { cwd: dir });
        equal(result.code, 0);
        console.log(result.text());
    });
});
