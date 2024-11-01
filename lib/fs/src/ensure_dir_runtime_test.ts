// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { equal, rejects, throws } from "@bearz/assert";
import * as path from "@std/path";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { ensureFile, ensureFileSync } from "./ensure_file.ts";
import {
    lstat,
    lstatSync,
    makeDir,
    makeDirSync,
    remove,
    removeSync,
    stat,
    statSync,
} from "./std.ts";

const test = Deno.test;
const moduleDir = path.dirname(path.fromFileUrl(import.meta.url));
const testdataDir = path.resolve(moduleDir, "testdata", "ensure_dir");

test("fs::ensureDir() creates dir if it does not exist", async function () {
    const baseDir = path.join(testdataDir, "not_exist");
    const testDir = path.join(baseDir, "test");

    try {
        await ensureDir(testDir);

        // test dir should exists.
        await stat(testDir);
    } finally {
        await remove(baseDir, { recursive: true });
    }
});

test("fs::ensureDirSync() creates dir if it does not exist", function () {
    const baseDir = path.join(testdataDir, "sync_not_exist");
    const testDir = path.join(baseDir, "test");

    try {
        ensureDirSync(testDir);

        // test dir should exists.
        statSync(testDir);
    } finally {
        removeSync(baseDir, { recursive: true });
    }
});

test("fs::ensureDir() ensures existing dir exists", async function () {
    const baseDir = path.join(testdataDir, "exist");
    const testDir = path.join(baseDir, "test");

    try {
        // create test directory
        await makeDir(testDir, { recursive: true });

        await ensureDir(testDir);

        // test dir should still exists.
        await stat(testDir);
    } finally {
        await remove(baseDir, { recursive: true });
    }
});

test("fs::ensureDirSync() ensures existing dir exists", function () {
    const baseDir = path.join(testdataDir, "sync_exist");
    const testDir = path.join(baseDir, "test");

    try {
        // create test directory
        makeDirSync(testDir, { recursive: true });

        ensureDirSync(testDir);

        // test dir should still exists.
        statSync(testDir);
    } finally {
        removeSync(baseDir, { recursive: true });
    }
});

test("fs::ensureDir() accepts links to dirs", async function () {
    const ldir = path.join(testdataDir, "ldir");

    await ensureDir(ldir);

    // test dir should still exists.
    await stat(ldir);
    // ldir should be still be a symlink
    const { isSymlink } = await lstat(ldir);
    equal(isSymlink, true);
});

test("fs::ensureDirSync() accepts links to dirs", function () {
    const ldir = path.join(testdataDir, "ldir");

    ensureDirSync(ldir);

    // test dir should still exists.
    statSync(ldir);
    // ldir should be still be a symlink
    const { isSymlink } = lstatSync(ldir);
    equal(isSymlink, true);
});

test("fs::ensureDir() rejects if input is a file", async function () {
    const baseDir = path.join(testdataDir, "exist_file");
    const testFile = path.join(baseDir, "test");

    try {
        await ensureFile(testFile);

        await rejects(
            async () => {
                await ensureDir(testFile);
            },
            Error,
            `Ensure path exists, expected 'dir', got 'file'`,
        );
    } finally {
        await remove(baseDir, { recursive: true });
    }
});

test("fs::ensureDirSync() throws if input is a file", function () {
    const baseDir = path.join(testdataDir, "exist_file_async");
    const testFile = path.join(baseDir, "test");

    try {
        ensureFileSync(testFile);

        throws(
            () => {
                ensureDirSync(testFile);
            },
            Error,
            `Ensure path exists, expected 'dir', got 'file'`,
        );
    } finally {
        removeSync(baseDir, { recursive: true });
    }
});

test("fs::ensureDir() rejects links to files", async function () {
    const lf = path.join(testdataDir, "lf");

    await rejects(
        async () => {
            await ensureDir(lf);
        },
        Error,
        `Ensure path exists, expected 'dir', got 'file'`,
    );
});

test("fs::ensureDirSync() rejects links to files", function () {
    const lf = path.join(testdataDir, "lf");

    throws(
        () => {
            ensureDirSync(lf);
        },
        Error,
        `Ensure path exists, expected 'dir', got 'file'`,
    );
});

const g = globalThis as Record<string, unknown>;

if (g.Deno && !g.BEARZ_USE_NODE) {
    test({
        name: "fs::ensureDir() rejects permission fs write error",
        permissions: { read: true },
        async fn() {
            const baseDir = path.join(testdataDir, "without_permission");

            // ensureDir fails because this test doesn't have write permissions,
            // but don't swallow that error.
            await rejects(
                async () => await ensureDir(baseDir),
                Deno.errors.NotCapable,
            );
        },
    });

    test({
        name: "fs::ensureDirSync() throws permission fs write error",
        permissions: { read: true },
        fn() {
            const baseDir = path.join(
                testdataDir,
                "sync_without_permission",
            );

            // ensureDirSync fails because this test doesn't have write permissions,
            // but don't swallow that error.
            throws(
                () => ensureDirSync(baseDir),
                Deno.errors.NotCapable,
            );
        },
    });
}
