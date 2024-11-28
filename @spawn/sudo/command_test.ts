import { skip } from "@bearz/testing";
import { equal, ok } from "@bearz/assert";
import { sudo } from "./command.ts";
import { cmd, pathFinder } from "@bearz/exec";

const test = Deno.test;
const noSudo = undefined === pathFinder.findExeSync("sudo");
const noLs = undefined === pathFinder.findExeSync("ls");

test("@spawn/sudo - version", skip(noSudo), async () => {
    const result = await sudo("--version");
    equal(result.code, 0);
    ok(result.text().startsWith("Sudo"));
});

test("@spawn/sudo - ls", skip(noSudo || noLs), async () => {
    const result2 = await sudo(cmd("ls"));
    ok(result2.text().length > 0);
    equal(result2.code, 0);
});
