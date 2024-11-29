import { skip } from "@bearz/testing";
import { equal, ok } from "@bearz/assert";
import { docker } from "./command.ts";
import { pathFinder } from "@bearz/exec/path-finder";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noDocker = undefined === await pathFinder.findExe("docker") !== undefined;

test("docker", skip(noDocker), async () => {
    const result = await docker({ help: true });
    equal(result.code, 0);
    ok(result.text().trim().startsWith("Usage"));
});
