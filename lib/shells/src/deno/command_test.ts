import { ok, equal } from "@bearz/assert";
import { skip } from "@bearz/assert/skip";
import { deno, denoScript } from "./command.ts";
import { remove, writeTextFile } from "@bearz/fs";
import { pathFinder } from "@bearz/exec/path-finder";

const test = Deno.test;
const shell = await pathFinder.findExe("deno");

test("shells::deno", skip(!shell), async () => {
    const result = await deno("--version");
    equal(result.code, 0);
    ok(result.text().startsWith("deno"));
});

test("shells::deno - invoke inline script", skip(!shell), async () => {
    const result = await denoScript("console.log('Hello, World!');");
    equal(await result.text(), `Hello, World!\n`);
    equal(result.code, 0);
});

test("shells::deno - invoke script files", skip(!shell), async () => {
    const script = `console.log('Hello, World!');`;
    await writeTextFile("test.js", script);
    await writeTextFile("test.ts", script);

    try {
        const result = await denoScript("test.js");
        equal(await result.text(), `Hello, World!\n`);
        equal(result.code, 0);

        const result2 = await denoScript("test.ts");
        equal(await result2.text(), `Hello, World!\n`);
        equal(result2.code, 0);
    } finally {
        await remove("test.js");
        await remove("test.ts");
    }
});
