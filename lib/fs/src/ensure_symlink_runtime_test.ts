// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// TODO(axetroy): Add test for Windows once symlink is implemented for Windows.
import { equal, rejects, throws } from "@bearz/assert";
import * as path from "@std/path";
import { ensureSymlink, ensureSymlinkSync } from "./ensure_symlink.ts";
import {
    lstat,
    lstatSync,
    makeDir,
    makeDirSync,
    readLink,
    readLinkSync,
    readTextFile,
    readTextFileSync,
    remove,
    removeSync,
    stat,
    statSync,
    symlink,
    symlinkSync,
    writeFile,
    writeFileSync,
    writeTextFile,
    writeTextFileSync,
} from "./std.ts";

const moduleDir = path.dirname(path.fromFileUrl(import.meta.url));
const testdataDir = path.resolve(moduleDir, "testdata");

Deno.test("ensureSymlink() rejects if file does not exist", async function () {
    const testDir = path.join(testdataDir, "link_file_1");
    const testFile = path.join(testDir, "test.txt");

    await rejects(
        async () => {
            await ensureSymlink(testFile, path.join(testDir, "test1.txt"));
        },
    );

    await rejects(
        async () => {
            await stat(testFile).then(() => {
                throw new Error("test file should exist.");
            });
        },
    );
});

Deno.test("ensureSymlinkSync() throws if file does not exist", function () {
    const testDir = path.join(testdataDir, "link_file_2");
    const testFile = path.join(testDir, "test.txt");

    throws(() => {
        ensureSymlinkSync(testFile, path.join(testDir, "test1.txt"));
    });

    throws(() => {
        statSync(testFile);
        throw new Error("test file should exist.");
    });
});

Deno.test("ensureSymlink() ensures linkName links to target", async function () {
    const testDir = path.join(testdataDir, "link_file_3");
    const testFile = path.join(testDir, "test.txt");
    const linkFile = path.join(testDir, "link.txt");

    try {
        await makeDir(testDir, { recursive: true });
        await writeFile(testFile, new Uint8Array());

        await ensureSymlink(testFile, linkFile);
        await ensureSymlink(testFile, linkFile);

        const srcStat = await lstat(testFile);
        const linkStat = await lstat(linkFile);

        equal(srcStat.isFile, true);
        equal(linkStat.isSymlink, true);
    } finally {
        await remove(testDir, { recursive: true });
    }
});

Deno.test("ensureSymlinkSync() ensures linkName links to target", function () {
    const testDir = path.join(testdataDir, "link_file_4");
    const testFile = path.join(testDir, "test.txt");
    const linkFile = path.join(testDir, "link.txt");

    try {
        makeDirSync(testDir, { recursive: true });
        writeFileSync(testFile, new Uint8Array());

        ensureSymlinkSync(testFile, linkFile);
        ensureSymlinkSync(testFile, linkFile);

        const srcStat = lstatSync(testFile);
        const linkStat = lstatSync(linkFile);

        equal(srcStat.isFile, true);
        equal(linkStat.isSymlink, true);
    } finally {
        removeSync(testDir, { recursive: true });
    }
});

Deno.test("ensureSymlink() rejects if the linkName path already exist", async function () {
    const testDir = path.join(testdataDir, "link_file_5");
    const linkFile = path.join(testDir, "test.txt");
    const linkDir = path.join(testDir, "test_dir");
    const linkSymlink = path.join(testDir, "test_symlink");
    const targetFile = path.join(testDir, "target.txt");

    await makeDir(testDir, { recursive: true });
    await writeTextFile(linkFile, "linkFile");
    await makeDir(linkDir);
    await symlink("non-existent", linkSymlink, { type: "file" });
    await writeTextFile(targetFile, "targetFile");

    await rejects(
        async () => {
            await ensureSymlink(targetFile, linkFile);
        },
    );
    await rejects(
        async () => {
            await ensureSymlink(targetFile, linkDir);
        },
    );
    await rejects(
        async () => {
            await ensureSymlink(targetFile, linkSymlink);
        },
    );

    equal(await readTextFile(linkFile), "linkFile");
    equal((await stat(linkDir)).isDirectory, true);
    equal(await readLink(linkSymlink), "non-existent");
    equal(await readTextFile(targetFile), "targetFile");

    await remove(testDir, { recursive: true });
});

Deno.test("ensureSymlinkSync() throws if the linkName path already exist", function () {
    const testDir = path.join(testdataDir, "link_file_6");
    const linkFile = path.join(testDir, "test.txt");
    const linkDir = path.join(testDir, "test_dir");
    const linkSymlink = path.join(testDir, "test_symlink");
    const targetFile = path.join(testDir, "target.txt");

    makeDirSync(testDir, { recursive: true });
    writeTextFileSync(linkFile, "linkFile");
    makeDirSync(linkDir);
    symlinkSync("non-existent", linkSymlink, { type: "file" });
    writeTextFileSync(targetFile, "targetFile");

    throws(() => {
        ensureSymlinkSync(targetFile, linkFile);
    });
    throws(() => {
        ensureSymlinkSync(targetFile, linkDir);
    });
    throws(() => {
        ensureSymlinkSync(targetFile, linkSymlink);
    });

    equal(readTextFileSync(linkFile), "linkFile");
    equal(statSync(linkDir).isDirectory, true);
    equal(readLinkSync(linkSymlink), "non-existent");
    equal(readTextFileSync(targetFile), "targetFile");

    removeSync(testDir, { recursive: true });
});

Deno.test("ensureSymlink() ensures dir linkName links to dir target", async function () {
    const testDir = path.join(testdataDir, "link_file_origin_3");
    const linkDir = path.join(testdataDir, "link_file_link_3");
    const testFile = path.join(testDir, "test.txt");

    try {
        await makeDir(testDir, { recursive: true });
        await writeFile(testFile, new Uint8Array());

        await ensureSymlink(testDir, linkDir);
        await ensureSymlink(testDir, linkDir);

        const testDirStat = await lstat(testDir);
        const linkDirStat = await lstat(linkDir);
        const testFileStat = await lstat(testFile);

        equal(testFileStat.isFile, true);
        equal(testDirStat.isDirectory, true);
        equal(linkDirStat.isSymlink, true);
    } finally {
        await remove(linkDir, { recursive: true });
        await remove(testDir, { recursive: true });
    }
});

Deno.test("ensureSymlinkSync() ensures dir linkName links to dir target", function () {
    const testDir = path.join(testdataDir, "link_file_origin_3");
    const linkDir = path.join(testdataDir, "link_file_link_3");
    const testFile = path.join(testDir, "test.txt");

    makeDirSync(testDir, { recursive: true });
    writeFileSync(testFile, new Uint8Array());

    ensureSymlinkSync(testDir, linkDir);
    ensureSymlinkSync(testDir, linkDir);

    const testDirStat = lstatSync(testDir);
    const linkDirStat = lstatSync(linkDir);
    const testFileStat = lstatSync(testFile);

    equal(testFileStat.isFile, true);
    equal(testDirStat.isDirectory, true);
    equal(linkDirStat.isSymlink, true);

    removeSync(linkDir, { recursive: true });
    removeSync(testDir, { recursive: true });
});

Deno.test("ensureSymlink() creates symlink with relative target", async function () {
    const testDir = path.join(testdataDir, "symlink-relative");
    const testLinkName = path.join(testDir, "link.txt");
    const testFile = path.join(testDir, "target.txt");

    await makeDir(testDir);

    await writeFile(testFile, new Uint8Array());

    await ensureSymlink("target.txt", testLinkName);

    const testDirStat = await lstat(testDir);
    const linkDirStat = await lstat(testLinkName);
    const testFileStat = await lstat(testFile);

    equal(testFileStat.isFile, true);
    equal(testDirStat.isDirectory, true);
    equal(linkDirStat.isSymlink, true);

    await remove(testDir, { recursive: true });
});

Deno.test("ensureSymlinkSync() creates symlink with relative target", function () {
    const testDir = path.join(testdataDir, "symlink-relative-sync");
    const testLinkName = path.join(testDir, "link.txt");
    const testFile = path.join(testDir, "target.txt");

    makeDirSync(testDir);

    writeFileSync(testFile, new Uint8Array());

    ensureSymlinkSync("target.txt", testLinkName);

    const testDirStat = lstatSync(testDir);
    const linkDirStat = lstatSync(testLinkName);
    const testFileStat = lstatSync(testFile);

    equal(testFileStat.isFile, true);
    equal(testDirStat.isDirectory, true);
    equal(linkDirStat.isSymlink, true);

    removeSync(testDir, { recursive: true });
});
