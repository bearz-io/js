// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { equal, ok, stringIncludes } from "@bearz/assert";
import { fromFileUrl, join, joinGlobs, normalize, relative } from "@std/path";
import { expandGlob, type ExpandGlobOptions, expandGlobSync } from "./expand_glob.ts";
import { cwd } from "./posix.ts";

const test = Deno.test;

async function expandGlobArray(
    globString: string,
    options: ExpandGlobOptions,
    { forceRoot = "" } = {},
): Promise<string[]> {
    const paths = await Array.fromAsync(
        expandGlob(globString, options),
        ({ path }) => path,
    );
    paths.sort();
    const root = normalize(forceRoot || options.root || cwd());
    for (const path of paths) {
        ok(path.startsWith(root));
    }
    const relativePaths = paths.map(
        (path: string): string => relative(root, path) || ".",
    );
    relativePaths.sort();
    return relativePaths;
}

function expandGlobSyncArray(
    globString: string,
    options: ExpandGlobOptions,
    { forceRoot = "" } = {},
): string[] {
    const pathsSync = [...expandGlobSync(globString, options)].map(
        ({ path }): string => path,
    );
    pathsSync.sort();
    const root = normalize(forceRoot || options.root || cwd());
    for (const path of pathsSync) {
        ok(path.startsWith(root));
    }
    const relativePaths = pathsSync.map(
        (path: string): string => relative(root, path) || ".",
    );
    relativePaths.sort();
    return relativePaths;
}

const EG_OPTIONS: ExpandGlobOptions = {
    root: fromFileUrl(new URL(join("testdata", "glob"), import.meta.url)),
    includeDirs: true,
    extended: false,
};

test("fs::expandGlob() with wildcard input returns all test data", async function () {
    const options = EG_OPTIONS;
    equal(await expandGlobArray("*", options), [
        "a[b]c",
        "abc",
        "abcdef",
        "abcdefghi",
        "link",
        "subdir",
    ]);
});

test("fs::expandGlobSync() with wildcard input returns all test data", function () {
    const options = EG_OPTIONS;
    equal(expandGlobSyncArray("*", options), [
        "a[b]c",
        "abc",
        "abcdef",
        "abcdefghi",
        "link",
        "subdir",
    ]);
});

test("fs::expandGlob() with */ input returns subdirs", async function () {
    const options = EG_OPTIONS;
    equal(await expandGlobArray("*/", options), [
        "a[b]c",
        "subdir",
    ]);
});

test("fs::expandGlobSync() with */ input returns subdirs", function () {
    const options = EG_OPTIONS;
    equal(expandGlobSyncArray("*/", options), [
        "a[b]c",
        "subdir",
    ]);
});

test("fs::expandGlob() with subdir/../* input expands parent", async function () {
    const options = EG_OPTIONS;
    equal(await expandGlobArray("subdir/../*", options), [
        "a[b]c",
        "abc",
        "abcdef",
        "abcdefghi",
        "link",
        "subdir",
    ]);
});

test("fs::expandGlobSync() with subdir/../* input expands parent", function () {
    const options = EG_OPTIONS;
    equal(expandGlobSyncArray("subdir/../*", options), [
        "a[b]c",
        "abc",
        "abcdef",
        "abcdefghi",
        "link",
        "subdir",
    ]);
});

test("fs::expandGlob() accepts extended option set as true", async function () {
    const options = { ...EG_OPTIONS, extended: true };
    equal(await expandGlobArray("abc?(def|ghi)", options), [
        "abc",
        "abcdef",
    ]);
    equal(await expandGlobArray("abc*(def|ghi)", options), [
        "abc",
        "abcdef",
        "abcdefghi",
    ]);
    equal(await expandGlobArray("abc+(def|ghi)", options), [
        "abcdef",
        "abcdefghi",
    ]);
    equal(await expandGlobArray("abc@(def|ghi)", options), ["abcdef"]);
    equal(await expandGlobArray("abc{def,ghi}", options), ["abcdef"]);
    equal(await expandGlobArray("abc!(def|ghi)", options), ["abc"]);
});

test("fs::expandGlobSync() accepts extended option set as true", function () {
    const options = { ...EG_OPTIONS, extended: true };
    equal(expandGlobSyncArray("abc?(def|ghi)", options), [
        "abc",
        "abcdef",
    ]);
    equal(expandGlobSyncArray("abc*(def|ghi)", options), [
        "abc",
        "abcdef",
        "abcdefghi",
    ]);
    equal(expandGlobSyncArray("abc+(def|ghi)", options), [
        "abcdef",
        "abcdefghi",
    ]);
    equal(expandGlobSyncArray("abc@(def|ghi)", options), ["abcdef"]);
    equal(expandGlobSyncArray("abc{def,ghi}", options), ["abcdef"]);
    equal(expandGlobSyncArray("abc!(def|ghi)", options), ["abc"]);
});

test("fs::expandGlob() with globstar returns all dirs", async function () {
    const options = { ...EG_OPTIONS };
    equal(
        await expandGlobArray("**/abc", options),
        ["abc", join("subdir", "abc")],
    );
});

test("fs::expandGlobSync() with globstar returns all dirs", function () {
    const options = { ...EG_OPTIONS };
    equal(
        expandGlobSyncArray("**/abc", options),
        ["abc", join("subdir", "abc")],
    );
});

test("fs::expandGlob() with globstar parent returns all dirs", async function () {
    const options = { ...EG_OPTIONS, globstar: true };
    equal(
        await expandGlobArray(joinGlobs(["subdir", "**", ".."], options), options),
        ["."],
    );
});

test("fs::expandGlobSync() with globstar parent returns all dirs", function () {
    const options = { ...EG_OPTIONS, globstar: true };
    equal(
        expandGlobSyncArray(joinGlobs(["subdir", "**", ".."], options), options),
        ["."],
    );
});

test("fs::expandGlob() with globstar parent and globstar option set to false returns current dir", async function () {
    const options = { ...EG_OPTIONS, globstar: false };
    equal(await expandGlobArray("**", options), [
        ".",
        "a[b]c",
        "abc",
        "abcdef",
        "abcdefghi",
        "link",
        "subdir",
    ]);
});

test("fs::expandGlobSync() with globstar parent and globstar option set to false returns current dir", function () {
    const options = { ...EG_OPTIONS, globstar: false };
    equal(expandGlobSyncArray("**", options), [
        ".",
        "a[b]c",
        "abc",
        "abcdef",
        "abcdefghi",
        "link",
        "subdir",
    ]);
});

test("fs::expandGlob() accepts includeDirs option set to false", async function () {
    const options = { ...EG_OPTIONS, includeDirs: false };
    equal(await expandGlobArray("subdir", options), []);
});

test("fs::expandGlobSync() accepts includeDirs option set to false", function () {
    const options = { ...EG_OPTIONS, includeDirs: false };
    equal(expandGlobSyncArray("subdir", options), []);
});

test(
    "fs::expandGlob() throws permission error without fs permissions",
    async function () {
        const exampleUrl = new URL("testdata/expand_wildcard.js", import.meta.url);
        const command = new Deno.Command(Deno.execPath(), {
            args: [
                "run",
                "--quiet",
                "--no-lock",
                exampleUrl.toString(),
            ],
        });
        const { code, success, stdout, stderr } = await command.output();
        const decoder = new TextDecoder();
        ok(!success);
        equal(code, 1);
        equal(decoder.decode(stdout), "");
        stringIncludes(decoder.decode(stderr), "NotCapable");
    },
);

test("fs::expandGlob() returns single entry when root is not glob", async function () {
    const options = { ...EG_OPTIONS, root: join(EG_OPTIONS.root!, "a[b]c") };
    equal(await expandGlobArray("*", options), ["foo"]);
});

test("fs::expandGlobSync() returns single entry when root is not glob", function () {
    const options = { ...EG_OPTIONS, root: join(EG_OPTIONS.root!, "a[b]c") };
    equal(expandGlobSyncArray("*", options), ["foo"]);
});

test("fs::expandGlob() accepts followSymlinks option set to true", async function () {
    const options = {
        ...EG_OPTIONS,
        root: join(EG_OPTIONS.root!, "link"),
        followSymlinks: true,
    };
    equal(await expandGlobArray("*", options), ["abc"]);
});

test("fs::expandGlobSync() accepts followSymlinks option set to true", function () {
    const options = {
        ...EG_OPTIONS,
        root: join(EG_OPTIONS.root!, "link"),
        followSymlinks: true,
    };
    equal(expandGlobSyncArray("*", options), ["abc"]);
});

test("fs::expandGlob() accepts followSymlinks option set to true with canonicalize", async function () {
    const options = {
        ...EG_OPTIONS,
        root: join(EG_OPTIONS.root!, "."),
        followSymlinks: true,
    };
    equal(
        await expandGlobArray("**/abc", options),
        ["abc", join("subdir", "abc")],
    );
});

test("fs::expandGlobSync() accepts followSymlinks option set to true with canonicalize", function () {
    const options = {
        ...EG_OPTIONS,
        root: join(EG_OPTIONS.root!, "."),
        followSymlinks: true,
    };
    equal(
        expandGlobSyncArray("**/abc", options),
        ["abc", join("subdir", "abc")],
    );
});

test("fs::expandGlob() accepts followSymlinks option set to true without canonicalize", async function () {
    const options = {
        ...EG_OPTIONS,
        root: join(EG_OPTIONS.root!, "."),
        followSymlinks: true,
        canonicalize: false,
    };
    equal(
        await expandGlobArray("**/abc", options),
        ["abc", join("link", "abc"), join("subdir", "abc")],
    );
});

test("fs::expandGlobSync() accepts followSymlinks option set to true without canonicalize", function () {
    const options = {
        ...EG_OPTIONS,
        root: join(EG_OPTIONS.root!, "."),
        followSymlinks: true,
        canonicalize: false,
    };
    equal(
        expandGlobSyncArray("**/abc", options),
        ["abc", join("link", "abc"), join("subdir", "abc")],
    );
});

const g = globalThis as Record<string, unknown>;

if (g.Deno && !g.BEARZ_USE_NODE) {
    test(
        "fs::expandGlob() does not require read permissions when root path is specified",
        {
            permissions: { read: [EG_OPTIONS.root!] },
        },
        async function () {
            const options = { root: EG_OPTIONS.root! };
            equal(await expandGlobArray("abc", options), ["abc"]);
        },
    );

    test(
        "fs::expandGlobSync() does not require read permissions when root path is specified",
        {
            permissions: { read: [EG_OPTIONS.root!] },
        },
        function () {
            const options = { root: EG_OPTIONS.root! };
            equal(expandGlobSyncArray("abc", options), ["abc"]);
        },
    );

    test(
        "fs::expandGlob() does not require read permissions when an absolute glob is specified",
        {
            permissions: { read: [EG_OPTIONS.root!] },
        },
        async function () {
            equal(
                await expandGlobArray(`${EG_OPTIONS.root!}/abc`, {}, {
                    forceRoot: EG_OPTIONS.root!,
                }),
                ["abc"],
            );
        },
    );

    test(
        "fs::expandGlobSync() does not require read permissions when an absolute glob is specified",
        {
            permissions: { read: [EG_OPTIONS.root!] },
        },
        function () {
            equal(
                expandGlobSyncArray(`${EG_OPTIONS.root!}/abc`, {}, {
                    forceRoot: EG_OPTIONS.root!,
                }),
                ["abc"],
            );
        },
    );
}
