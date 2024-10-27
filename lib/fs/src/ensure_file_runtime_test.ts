// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { rejects, throws } from "@bearz/assert";
import * as path from "@std/path";
import { ensureFile, ensureFileSync } from "./ensure_file.ts";
import { makeDir, makeDirSync, remove, removeSync, stat, statSync, writeFile, writeFileSync } from "./std.ts";

const test = Deno.test;
const moduleDir = path.dirname(path.fromFileUrl(import.meta.url));
const testdataDir = path.resolve(moduleDir, "testdata");

test("fs::ensureFile() creates file if it does not exist", async function () {
    const testDir = path.join(testdataDir, "ensure_file_1");
    const testFile = path.join(testDir, "test.txt");

    try {
        await ensureFile(testFile);

        // test file should exists.
        await stat(testFile);
    } finally {
        await remove(testDir, { recursive: true });
    }
});

test("fs::ensureFileSync() creates file if it does not exist", function () {
    const testDir = path.join(testdataDir, "ensure_file_2");
    const testFile = path.join(testDir, "test.txt");

    try {
        ensureFileSync(testFile);

        // test file should exists.
        statSync(testFile);
    } finally {
        removeSync(testDir, { recursive: true });
    }
});

test("fs::ensureFile() ensures existing file exists", async function () {
    const testDir = path.join(testdataDir, "ensure_file_3");
    const testFile = path.join(testDir, "test.txt");

    try {
        await makeDir(testDir, { recursive: true });
        await writeFile(testFile, new Uint8Array());

        await ensureFile(testFile);

        // test file should exists.
        await stat(testFile);
    } finally {
        await remove(testDir, { recursive: true });
    }
});

test("fs::ensureFileSync() ensures existing file exists", function () {
    const testDir = path.join(testdataDir, "ensure_file_4");
    const testFile = path.join(testDir, "test.txt");

    try {
        makeDirSync(testDir, { recursive: true });
        writeFileSync(testFile, new Uint8Array());

        ensureFileSync(testFile);

        // test file should exists.
        statSync(testFile);
    } finally {
        removeSync(testDir, { recursive: true });
    }
});

test("fs::ensureFile() rejects if input is dir", async function () {
    const testDir = path.join(testdataDir, "ensure_file_5");

    try {
        await makeDir(testDir, { recursive: true });

        await rejects(
            async () => {
                await ensureFile(testDir);
            },
            Error,
            `Ensure path exists, expected 'file', got 'dir'`,
        );
    } finally {
        await remove(testDir, { recursive: true });
    }
});

test("fs::ensureFileSync() throws if input is dir", function () {
    const testDir = path.join(testdataDir, "ensure_file_6");

    try {
        makeDirSync(testDir, { recursive: true });

        throws(
            () => {
                ensureFileSync(testDir);
            },
            Error,
            `Ensure path exists, expected 'file', got 'dir'`,
        );
    } finally {
        removeSync(testDir, { recursive: true });
    }
});

const g = globalThis as Record<string, unknown>;

if (g.Deno && !g.BEARZ_USE_NODE) {
    test({
        name: "fs::ensureFile() rejects permission fs write error",
        permissions: { read: true },
        async fn() {
            const testDir = path.join(testdataDir, "ensure_file_7");
            const testFile = path.join(testDir, "test.txt");

            // ensureFile fails because this test doesn't have write permissions,
            // but don't swallow that error.
            await rejects(
                async () => await ensureFile(testFile),
                Deno.errors.NotCapable,
            );
        },
    });

    test({
        name: "fs::ensureFileSync() throws permission fs write error",
        permissions: { read: true },
        fn() {
            const testDir = path.join(testdataDir, "ensure_file_8");
            const testFile = path.join(testDir, "test.txt");

            // ensureFileSync fails because this test doesn't have write permissions,
            // but don't swallow that error.
            throws(
                () => ensureFileSync(testFile),
                Deno.errors.NotCapable,
            );
        },
    });

    test({
        name: "fs::ensureFile() can write file without write permissions on parent directory",
        permissions: {
            read: true,
            write: [
                path.join(testdataDir, "ensure_file_9"),
                path.join(testdataDir, "ensure_file_9", "test.txt"),
            ],
            run: [Deno.execPath()],
        },
        async fn() {
            const testDir = path.join(testdataDir, "ensure_file_9");
            const testFile = path.join(testDir, "test.txt");

            try {
                await makeDir(testDir, { recursive: true });
                await Deno.permissions.revoke({ name: "write", path: testDir });

                // should still work as the parent directory already exists
                await ensureFile(testFile);

                // test file should exist
                await stat(testFile);
            } finally {
                // it's dirty, but we can't remove the test output in the same process after dropping the write permission
                await new Deno.Command(Deno.execPath(), {
                    args: [
                        "eval",
                        "--no-lock",
                        `Deno.removeSync("${testDir}", { recursive: true });`,
                    ],
                }).output();
            }
        },
    });

    test({
        name: "fs::ensureFileSync() can write file without write permissions on parent directory",
        permissions: {
            read: true,
            write: [
                path.join(testdataDir, "ensure_file_10"),
                path.join(testdataDir, "ensure_file_10", "test.txt"),
            ],
            run: [Deno.execPath()],
        },
        fn() {
            const testDir = path.join(testdataDir, "ensure_file_10");
            const testFile = path.join(testDir, "test.txt");

            try {
                Deno.mkdirSync(testDir, { recursive: true });
                Deno.permissions.revokeSync({ name: "write", path: testDir });

                // should still work as the parent directory already exists
                ensureFileSync(testFile);

                // test file should exist
                Deno.statSync(testFile);
            } finally {
                // it's dirty, but we can't remove the test output in the same process after dropping the write permission
                new Deno.Command(Deno.execPath(), {
                    args: [
                        "eval",
                        "--no-lock",
                        `Deno.removeSync("${testDir}", { recursive: true });`,
                    ],
                }).outputSync();
            }
        },
    });
}