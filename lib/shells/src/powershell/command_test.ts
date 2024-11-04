import { equal } from "@bearz/assert";
import { skip } from "@bearz/assert/skip";
import { remove, writeTextFile } from "@bearz/fs";
import { powershellScript } from "./command.ts";
import { pathFinder } from "@bearz/exec";

const test = Deno.test;
const EOL = Deno.build.os === "windows" ? "\r\n" : "\n";
const shell = await pathFinder.findExe("powershell");

test("shells::powershell - simple inline test", skip(!shell), async () => {
    const cmd = await powershellScript("Write-Host 'Hello, World!'");
    equal(cmd.text(), `Hello, World!\n`);
    equal(0, cmd.code);
});

test("shells::powershell - multi-line inline test", skip(!shell), async () => {
    const cmd = await powershellScript(`
        $a = 1
        $b = 2
        $a + $b
    `);
    equal(cmd.text(), `3${EOL}`);
    equal(0, cmd.code);
});

test("shells::powershell - simple file test", skip(!shell), async () => {
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
