import { skip } from "@bearz/testing";
import { ok } from "@bearz/assert";
import { pathFinder } from "@bearz/exec/path-finder";
import { pip } from "./command.ts";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noPip = undefined === await pathFinder.findExe("pip");

test("@spawn/python/pip - version", skip(noPip), async () => {
    const cmd = pip(["--version"]);
    ok((await cmd.text()).startsWith("pip"));
});
