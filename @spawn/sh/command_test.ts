import { skip } from "@bearz/testing";
import { equal } from "@bearz/assert";
import { remove, writeTextFile } from "@bearz/fs";
import { shScript } from "./command.ts";
import { pathFinder } from "@bearz/exec/path-finder";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noSh = undefined === await pathFinder.findExe("sh");

test("@spawn/sh - simple inline test", skip(noSh), async () => {
    const cmd = await shScript("echo 'Hello, World!'");
    equal(cmd.text(), "Hello, World!\n");
    equal(0, cmd.code);
});

test("@spawn/sh - multi-line inline test", skip(noSh), async () => {
    const cmd = await shScript(`
        a=1
        b=2
        expr $a + $b
    `);
    equal(cmd.text(), "3\n");
    equal(0, cmd.code);
});

test("@spawn/sh - simple file test", skip(noSh), async () => {
    await writeTextFile("test.sh", "echo 'Hello, World!'");
    try {
        // purposely add space after test.ps1
        const cmd = await shScript("test.sh ");
        equal(0, cmd.code);
        equal(cmd.text(), "Hello, World!\n");
    } finally {
        await remove("test.sh");
    }
});
