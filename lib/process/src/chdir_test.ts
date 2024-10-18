import { equal } from "@bearz/assert";
import { join, resolve } from "@std/path";
import { chdir } from "./chdir.ts";
import { cwd } from "./cwd.ts";

const test = Deno.test;

test("process::chdir", () => {
    const pwd = cwd();
    const dir = resolve(join(pwd, ".."));
    equal(pwd, cwd());
    equal(chdir(dir), undefined);
    equal(cwd(), dir);
    chdir(pwd);
});
