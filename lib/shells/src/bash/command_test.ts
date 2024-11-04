import { equal } from "@bearz/assert";
import { skip } from "@bearz/assert/skip";
import { remove, writeTextFile } from "@bearz/fs";
import { bashScript } from "./command.ts";
import { pathFinder } from "@bearz/exec";

const test = Deno.test;
const shell = await pathFinder.findExe("bash");

test("shells::bash - simple inline test", skip(!shell), async () => {
    const cmd = await bashScript("echo 'Hello, World!'");
    equal(cmd.text(), "Hello, World!\n");
    equal(0, cmd.code);
});

test("shells::bash - multi-line inline test", skip(!shell), async () => {
    const cmd = await bashScript(`
        a=1
        b=2
        expr $a + $b
    `);
    equal(cmd.text(), "3\n");
    equal(0, cmd.code);
});

test("shells::bash - simple file test", skip(!shell), async () => {
    await writeTextFile("test.sh", "echo 'Hello, World!'");
    try {
        // purposely add space after test.ps1
        const cmd = await bashScript("test.sh ");
        equal(0, cmd.code);
        equal(cmd.text(), "Hello, World!\n");
    } finally {
        await remove("test.sh");
    }
});
