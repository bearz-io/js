
import { ok, equal } from "@bearz/assert";
import { skip } from "@bearz/assert/skip";
import { tsx, tsxScript } from "./command.ts";
import { remove, writeTextFile } from "@bearz/fs";
import { pathFinder } from "@bearz/exec/path-finder";

const test = Deno.test;
const shell = await pathFinder.findExe("tsx");

test("shells::tsx - script", skip(!shell), async () => {
    const result = await tsxScript("console.log('Hello, World!');");
    equal(await result.text(), `Hello, World!\n`);
    equal(result.code, 0);
});

test("shells::tsx", skip(!shell), async () => {
    const result = await tsx("--version");
    equal(result.code, 0);
    ok(result.text().startsWith("tsx"));
});

test("shells::tsx - script using files", skip(!shell), async () => {
    const script = `console.log('Hello, World!');`;
    await writeTextFile("test.ts", script);
    await writeTextFile("test.mts", script);
    await writeTextFile("test.cts", script);

    try {
        const result = await tsxScript("test.ts");
        equal(await result.text(), `Hello, World!\n`);
        equal(result.code, 0);

        const result2 = await tsxScript("test.mts");
        equal(await result2.text(), `Hello, World!\n`);
        equal(result2.code, 0);

        const result3 = await tsxScript("test.cts");
        equal(await result3.text(), `Hello, World!\n`);
        equal(result3.code, 0);
    } finally {
        await remove("test.ts");
        await remove("test.mts");
        await remove("test.cts");
    }
});
