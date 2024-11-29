import { skip } from "@bearz/testing";
import { equal, ok } from "@bearz/assert";
import { node, nodeScript } from "./command.ts";
import { remove, writeTextFile } from "@bearz/fs";
import { pathFinder } from "@bearz/exec/path-finder";

const test = Deno.test;
const noNode = undefined === await pathFinder.findExe("node") !== undefined;

test("@spawn/node - script", skip(noNode), async () => {
    const result = await nodeScript("console.log('Hello, World!');");
    equal(await result.text(), `Hello, World!\n`);
    equal(result.code, 0);
});

test("@spawn/node - version", skip(noNode), async () => {
    const result = await node("--version");
    equal(result.code, 0);
    ok(result.text().startsWith("v"));
});

test("@spawn/node - script with files", skip(noNode), async () => {
    const script = `console.log('Hello, World!');`;
    await writeTextFile("test.js", script);
    await writeTextFile("test.mjs", script);
    await writeTextFile("test.cjs", script);

    try {
        const result = await nodeScript("test.js");
        equal(result.text(), `Hello, World!\n`);
        equal(result.code, 0);

        const result2 = await nodeScript("test.mjs");
        equal(result2.text(), `Hello, World!\n`);
        equal(result2.code, 0);

        const result3 = await nodeScript("test.cjs");
        equal(result3.text(), `Hello, World!\n`);
        equal(result3.code, 0);
    } finally {
        await remove("test.js");
        await remove("test.mjs");
        await remove("test.cjs");
    }
});
