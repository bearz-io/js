import { equal, ok } from "@bearz/assert";
import { skip } from "@bearz/assert/skip";
import { bun, bunScript } from "./command.ts";
import { remove, writeTextFile } from "@bearz/fs";
import { pathFinder } from "@bearz/exec/path-finder";

const test = Deno.test;
const shell = await pathFinder.findExe("bun");

test("shells::bun - simple inline", skip(!shell), async () => {
    const result = await bun("--version");
    equal(result.code, 0);
    // todo: update test to be less brittle
    ok(result.text().startsWith("1"));
});

test("shells::bun - invoke inline script", skip(!shell), async () => {
    const result = await bunScript("console.log('Hello, World!');");
    equal(await result.text(), `Hello, World!\n`);
    equal(result.code, 0);
});

test("shells::bun - invoke script files", skip(!shell), async () => {
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
