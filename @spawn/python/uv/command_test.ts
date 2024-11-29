import { skip } from "@bearz/testing";
import { ok } from "@bearz/assert";
import { pathFinder } from "@bearz/exec/path-finder";
import { uv } from "./command.ts";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noPip = undefined === await pathFinder.findExe("uv");

test("@spawn/python/uv - version", skip(noPip), async () => {
    const cmd = uv(["--version"]);
    ok((await cmd.text()).startsWith("uv"));
});
