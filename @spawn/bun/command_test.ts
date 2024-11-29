import { equal, ok } from "@bearz/assert";
import { skip } from "@bearz/assert/skip";
import { bun, bunScript } from "./command.ts";
import { remove, writeTextFile } from "@bearz/fs";
import { pathFinder } from "@bearz/exec/path-finder";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noBun = undefined === await pathFinder.findExe("bun");

test("@spawn/bun - simple inline", skip(noBun), async () => {
    const result = await bun("--version");
    equal(result.code, 0);
    // todo: update test to be less brittle
    ok(result.text().startsWith("1"));
});

test("@spawn/bun - invoke inline script", skip(noBun), async () => {
    const result = await bunScript("console.log('Hello, World!');");
    equal(await result.text(), `Hello, World!\n`);
    equal(result.code, 0);
});

test("@spawn/bun - invoke script files", skip(noBun), async () => {
    const script = `console.log('Hello, World!');`;
    await writeTextFile("test.js", script);
    await writeTextFile("test.ts", script);

    try {
        const result = await bunScript("test.js");
        equal(await result.text(), `Hello, World!\n`);
        equal(result.code, 0);

        const result2 = await bunScript("test.ts");
        equal(await result2.text(), `Hello, World!\n`);
        equal(result2.code, 0);
    } finally {
        await remove("test.js");
        await remove("test.ts");
    }
});
