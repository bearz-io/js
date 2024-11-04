import { equal, ok } from "@bearz/assert";
import { skip } from "@bearz/assert/skip";
import { node, nodeScript } from "./command.ts";
import { remove, writeTextFile } from "@bearz/fs";
import { pathFinder } from "@bearz/exec";

const test = Deno.test;
const shell = await pathFinder.findExe("node");

test("shells::node - script", skip(!shell), async () => {
    const result = await nodeScript("console.log('Hello, World!');");
    equal(await result.text(), `Hello, World!\n`);
    equal(result.code, 0);
});

test("shells::node", skip(!shell), async () => {
    const result = await node("--version");
    equal(result.code, 0);
    ok(result.text().startsWith("v"));
});

test("shells::node - script with files", skip(!shell), async () => {
    const script = `console.log('Hello, World!');`;
    await writeTextFile("test.js", script);
    await writeTextFile("test.mjs", script);
    await writeTextFile("test.cjs", script);

    try {
        const result = await nodeScript("test.js");
        equal(await result.text(), `Hello, World!\n`);
        equal(result.code, 0);

        const result2 = await nodeScript("test.mjs");
        equal(await result2.text(), `Hello, World!\n`);
        equal(result2.code, 0);

        const result3 = await nodeScript("test.cjs");
        equal(await result3.text(), `Hello, World!\n`);
        equal(result3.code, 0);
    } finally {
        await remove("test.js");
        await remove("test.mjs");
        await remove("test.cjs");
    }
});
