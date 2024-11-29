import { skip } from "@bearz/testing";
import { equal } from "@bearz/assert";
import { isFile, remove, writeTextFile } from "@bearz/fs";
import { WINDOWS } from "@bearz/runtime-info/os";
import { resolve } from "@std/path";
import { cmdScript } from "./command.ts";

// DO NOT EDIT THIS LINE
const test = Deno.test;

test("@spawn/cmd - simple inline test", skip(!WINDOWS), async () => {
    const cmd1 = await cmdScript("echo Hello, World!");
    equal(cmd1.text(), "Hello, World!\r\n");
    equal(0, cmd1.code);
});

test("@spawn/cmd - simple inline test with options", skip(!WINDOWS), async () => {
    const cmd1 = await cmdScript("echo Hello, World!").run();
    equal(0, cmd1.code);
});

test("@spawn/cmd - multi-line inline test", skip(!WINDOWS), async () => {
    const cmd1 = await cmdScript(`
        set a=1
        echo %a%
    `);
    equal(cmd1.text(), "1\r\n");
    equal(0, cmd1.code);
});

test("@spawn/cmd - simple file test", skip(!WINDOWS), async () => {
    await writeTextFile(
        "test.cmd",
        `
    @echo off
    echo Hello, World!`,
    );
    try {
        const p = resolve("test.cmd");
        const exists = await isFile(p);

        if (!exists) {
            throw new Error("File does not exist at " + p);
        }

        // purposely add space after test.ps1
        const cmd1 = await cmdScript("test.cmd ");
        console.log(cmd1.errorText());
        console.log(cmd1.text());
        equal(cmd1.code, 0);
        equal(cmd1.text(), "Hello, World!\r\n");
    } finally {
        await remove("test.cmd");
    }
});
