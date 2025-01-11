import { ok } from "@bearz/assert";
import { sops } from "./command.ts";
import { pathFinder } from "@bearz/exec/path-finder";

const { test } = Deno;
const hasExe = await pathFinder.findExe("sops");

test("@spawn/sops:: - help", { ignore: !hasExe }, async () => {
    const r = await sops("-h");
    ok(r.code === 0);
});
