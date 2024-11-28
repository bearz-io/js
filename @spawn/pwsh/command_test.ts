import { skip } from "@bearz/testing";
import { equal } from "@bearz/assert";
import { remove, writeTextFile } from "@bearz/fs";
import { pwshScript } from "./command.ts";
import { EOL } from "@bearz/runtime-info/os";
import { pathFinder } from "@bearz/exec/path-finder";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noPwsh = undefined === await pathFinder.findExe("pwsh");

test("@spawn/pwsh - simple inline test", skip(noPwsh), async () => {
    const cmd = await pwshScript("Write-Host 'Hello, World!'");
    equal(cmd.text(), `Hello, World!${EOL}`);
    equal(0, cmd.code);
});

test("@spawn/pwsh - multi-line inline test", skip(noPwsh), async () => {
    const cmd = await pwshScript(`
        $a = 1
        $b = 2
        $a + $b
    `);
    equal(cmd.text(), `3${EOL}`);
    equal(0, cmd.code);
});

test("@spawn/pwsh - simple file test", skip(noPwsh), async () => {
    await writeTextFile("test.ps1", "Write-Host 'Hello, World!'");
    try {
        // purposely add space after test.ps1
        const cmd = await pwshScript("test.ps1 ");
        equal(0, cmd.code);
        equal(cmd.text(), `Hello, World!${EOL}`);
    } finally {
        await remove("test.ps1");
    }
});
