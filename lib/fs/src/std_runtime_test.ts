import {} from "@bearz/assert/use-node";
import { ok } from "@bearz/assert";
import {
    gid,
    isDir,
    isDirSync,
    isFile,
    isFileSync,
    makeDir,
    makeDirSync,
    readFile,
    readFileSync,
    readTextFile,
    readTextFileSync,
    remove,
    removeSync,
    stat,
    statSync,
    uid,
    writeFile,
    writeFileSync,
} from "./std.ts";
import { dirname, fromFileUrl, join } from "@std/path";

const test = Deno.test;
const usingNode = Deno.env.get("BEARZ_USE_NODE") === "true";
const runtime = usingNode ? "node" : "deno";
const dir = dirname(fromFileUrl(import.meta.url));
const root = dirname(dir);
const readme = join(root, "README.md");

function quietRemove(path: string): Promise<void> {
    return stat(path).then(() => remove(path)).catch(() => {});
}

function quietRemoveSync(path: string) {
    try {
        if (statSync(path)) {
            removeSync(path);
        }
    } catch {
        // do nothing
    }
}

test(`fs::makeDir ${runtime}`, async () => {
    const dest = join(dir, "testdata", "mkdir1");
    try {
        await makeDir(dest);
        ok(await isDir(dest));
    } finally {
        await quietRemove(dest);
    }
});

test(`fs::makeDirSync ${runtime}`, () => {
    const dest = join(dir, "testdata", "mkdir2");
    try {
        makeDirSync(dest);
        ok(isDirSync(dest));
    } finally {
        quietRemoveSync(dest);
    }
});

test(`fs::isFile ${runtime}`, () => {
    ok(isFile(readme));
});

test(`fs::isFileSync ${runtime}`, () => {
    ok(isFileSync(readme));
});

test(`fs::isDir ${runtime}`, () => {
    ok(isDir(dir));
});

test(`fs::isDirSync ${runtime}`, () => {
    ok(isDirSync(dir));
});

test("fs::uid ${runtime}", () => {
    ok(uid() !== -1);
});

test("fs::gid ${runtime}", () => {
    ok(gid() !== -1);
});

test("fs::stat ${runtime}", async () => {
    const data = await stat(readme);
    ok(data.isFile);
});

test("fs::statSync ${runtime}", () => {
    const data = statSync(readme);
    ok(data.isFile);
});

test(`fs::readFile ${runtime}`, async () => {
    const data = await readFile(readme);
    ok(data.length > 0);
});

test(`fs::readFileSync ${runtime}`, () => {
    const data = readFileSync(readme);
    ok(data.length > 0);
});

test(`fs::readTextFile ${runtime}`, async () => {
    const data = await readTextFile(readme);
    ok(data.length > 0);
});

test(`fs::readTextFileSync ${runtime}`, () => {
    const data = readTextFileSync(readme);
    ok(data.length > 0);
});

test(`fs::writeFile ${runtime}`, async () => {
    const dest = join(dir, "testdata", "README.md2");
    try {
        const data = await readFile(readme);
        await writeFile(dest, data);
        const data2 = await readFile(dest);
        ok(data2.length > 0);
    } finally {
        await quietRemove(dest);
    }
});

test(`fs::writeFileSync ${runtime}`, () => {
    const dest = join(dir, "testdata", "README.md3");
    try {
        const data = readFileSync(readme);
        writeFileSync(dest, data);
        const data2 = readFileSync(dest);
        ok(data2.length > 0);
    } finally {
        quietRemoveSync(dest);
    }
});

test(`fs::remove ${runtime}`, async () => {
    const dest = join(dir, "testdata", "README.md4");
    try {
        const data = await readFile(readme);
        await writeFile(dest, data);
        await remove(dest);
        try {
            await readFile(dest);
            ok(false, "should not be able to read file");
        } catch {
            // do nothing
        }
    } finally {
        await quietRemove(dest);
    }
});

test(`fs::removeSync ${runtime}`, () => {
    const dest = join(dir, "testdata", "README.md5");
    try {
        const data = readFileSync(readme);
        writeFileSync(dest, data);
        removeSync(dest);
        try {
            readFileSync(dest);
            ok(false, "should not be able to read file");
        } catch {
            // do nothing
        }
    } finally {
        quietRemoveSync(dest);
    }
});
