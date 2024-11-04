import { equal } from "@bearz/assert";
import { skip } from "@bearz/assert/skip";
import { pathFinder } from "@bearz/exec";
import { script } from "./script.ts";

const test = Deno.test;

const deno = await pathFinder.findExe("deno");

test("shells::run - default", async () => {
    const cmd = await script("echo 'Hello, World!'");
    equal(cmd.text().trim(), "Hello, World!");
    equal(0, cmd.code);
});

test("shells::run - specific shell deno", skip(!deno), async () => {
    const cmd = await script("console.log('Hello, World!')", { shell: "deno" });
    equal(cmd.text(), "Hello, World!\n");
    equal(0, cmd.code);
});

test("shells::run - pass in env vars", skip(!deno), async () => {
    const cmd = await script("console.log('Hello, ' + Deno.env.get(\"HELLO\"))", {
        shell: "deno",
        env: { "HELLO": "WORLD" },
    });
    equal(cmd.text(), "Hello, WORLD\n");
    equal(0, cmd.code);
});
