import { skip } from "@bearz/testing";
import { equal } from "@bearz/assert";
import { remove, writeTextFile } from "@bearz/fs";
import { bashScript } from "./command.ts";
import { pathFinder } from "@bearz/exec/path-finder";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noBash = undefined === await pathFinder.findExe("bash");

test("@spawn/bash - simple inline test", skip(noBash), async () => {
    const cmd = await bashScript("echo 'Hello, World!'");
    equal(cmd.text(), "Hello, World!\n");
    equal(0, cmd.code);
});

test("@spawn/bash - multi-line inline test", skip(noBash), async () => {
    const cmd = await bashScript(`
        a=1
        b=2
        expr $a + $b
    `);
    equal(cmd.text(), "3\n");
    equal(0, cmd.code);
});

test("@spawn/bash - simple file test", skip(noBash), async () => {
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
