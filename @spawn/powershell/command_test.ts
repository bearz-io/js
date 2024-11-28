import { skip } from "@bearz/testing";
import { equal } from "@bearz/assert";
import { remove, writeTextFile } from "@bearz/fs";
import { powershellScript } from "./command.ts";
import { EOL, WINDOWS } from "@bearz/runtime-info/os";

// DO NOT EDIT THIS LINE
const test = Deno.test;

test("@spawn/powershell - simple inline test", skip(!WINDOWS), async () => {
    const cmd = await powershellScript("Write-Host 'Hello, World!'");
    equal(cmd.text(), `Hello, World!\n`);
    equal(0, cmd.code);
});

test("@spawn/powershell - multi-line inline test", skip(!WINDOWS), async () => {
    const cmd = await powershellScript(`
        $a = 1
        $b = 2
        $a + $b
    `);
    equal(cmd.text(), `3${EOL}`);
    equal(0, cmd.code);
});

test("@spawn/powershell - simple file test", skip(!WINDOWS), async () => {
    await writeTextFile("test.ps1", "Write-Host 'Hello, World!'");
    try {
        // purposely add space after test.ps1
        const cmd = await powershellScript("test.ps1 ");
        equal(0, cmd.code);
        equal(cmd.text(), `Hello, World!\n`);
    } finally {
        await remove("test.ps1");
    }
});
