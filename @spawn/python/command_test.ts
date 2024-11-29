import { skip } from "@bearz/testing";
import { equal, ok } from "@bearz/assert";
import { remove, writeTextFile } from "@bearz/fs";
import { pathFinder } from "@bearz/exec/path-finder";
import { python, pythonScript } from "./command.ts";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const EOL = Deno.build.os === "windows" ? "\r\n" : "\n";
const noPython = undefined === await pathFinder.findExe("python");

test("@spawn/python - version", skip(noPython), async () => {
    const cmd = python(["-V"]);
    ok((await cmd.text()).startsWith("Python"));
});

test("@spawn/python - invoke inline script", skip(noPython), async () => {
    const cmd = await pythonScript("print('Hello, World!')");
    equal(cmd.text(), `Hello, World!${EOL}`);
    equal(0, cmd.code);
});

test("@spawn/python - invoke inline multi-line script", skip(noPython), async () => {
    const cmd = await pythonScript(`
print('1')
print('2')
    `);
    console.log(cmd.text());
    console.log(cmd.errorText());
    equal(cmd.text(), `1${EOL}2${EOL}`);
    equal(0, cmd.code);
});

test("@spawn/python - invoke script file", async () => {
    await writeTextFile("test.py", "print('Hello, World!')");
    try {
        // purposely add space after test.ps1
        const cmd = await pythonScript("test.py ");
        equal(0, cmd.code);
        equal(cmd.text(), `Hello, World!${EOL}`);
    } finally {
        await remove("test.py");
    }
});
