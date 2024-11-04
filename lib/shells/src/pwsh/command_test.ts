import { equal } from "@bearz/assert";
import { skip } from "@bearz/assert/skip";
import { remove, writeTextFile } from "@bearz/fs";
import { pwshScript } from "./command.ts";
import { pathFinder } from "@bearz/exec";

const test = Deno.test;
const shell = await pathFinder.findExe("pwsh");
const EOL = Deno.build.os == "windows" ? "\r\n" : "\n";

test("shells::pwsh - simple inline test", skip(!shell), async () => {
    const cmd = await pwshScript("Write-Host 'Hello, World!'");
    equal(cmd.text(), `Hello, World!${EOL}`);
    equal(0, cmd.code);
});

test("shells::pwsh - multi-line inline test", skip(!shell), async () => {
    const cmd = await pwshScript(`
        $a = 1
        $b = 2
        $a + $b
    `);
    equal(cmd.text(), `3${EOL}`);
    equal(0, cmd.code);
});

test("shells::pwsh - simple file test", skip(!shell), async () => {
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
