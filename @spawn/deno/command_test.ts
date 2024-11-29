import { deno, denoScript } from "./command.ts";
import { remove, writeTextFile } from "@bearz/fs";
import { pathFinder } from "@bearz/exec/path-finder";
import { equal, ok } from "@bearz/assert";

const test = Deno.test;
const hasExe = await pathFinder.findExe("deno") !== undefined;

test("@spawn/deno - version", { ignore: !hasExe }, async () => {
    const result = await deno("--version");
    equal(result.code, 0);
    ok(result.text().startsWith("deno"));
});

test("@spawn/deno -  invoke inline script", { ignore: !hasExe }, async () => {
    const result = await denoScript("console.log('Hello, World!');");
    equal(await result.text(), `Hello, World!\n`);
    equal(result.code, 0);
});

test("@spawn/deno -  invoke script files", async () => {
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
