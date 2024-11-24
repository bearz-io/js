import { equal } from "@bearz/assert";
import { splat, type SplatOptions, SplatSymbols } from "./splat.ts";

const test = Deno.test;
// deno-lint-ignore no-explicit-any
const g = globalThis as any;
const DEBUG = g.DEBUG;

test("exec::splat", () => {
    const args = splat({
        "version": true,
        splat: {
            prefix: "--",
        } as SplatOptions,
    });

    equal(args.length, 1);
    equal(args[0], "--version");
});

test("exec::splat with assign", () => {
    const args = splat({
        "foo": "bar",
        splat: {
            assign: "=",
        } as SplatOptions,
    });

    equal(args.length, 1);
    equal(args[0], "--foo=bar");
});

test("exec::splat with preserveCase", () => {
    const args = splat({
        "fooBar": "baz",
        splat: {
            preserveCase: true,
        } as SplatOptions,
    });

    equal(args.length, 2);
    equal(args[0], "--fooBar");
    equal(args[1], "baz");
});

test("exec::splat with shortFlag", () => {
    const args = splat({
        "f": "bar",
        splat: {
            shortFlag: true,
        } as SplatOptions,
    });

    equal(args.length, 2);
    equal(args[0], "-f");
    equal(args[1], "bar");
});

test("exec::splat with shortFlag and prefix", () => {
    const args = splat({
        "f": "bar",
        splat: {
            shortFlag: true,
        } as SplatOptions,
    });

    equal(args.length, 2);
    equal(args[0], "-f");
    equal(args[1], "bar");
});

test("exec::splat with boolean short flag", () => {
    const args = splat({
        "f": true,
        splat: {
            shortFlag: true,
        } as SplatOptions,
    });

    equal(args.length, 1);
    equal(args[0], "-f");
});

test("exec::splat with command array", () => {
    const args = splat({
        "foo": "bar",
        splat: {
            command: ["git", "clone"],
        } as SplatOptions,
    });

    if (DEBUG) {
        console.log(args);
    }

    equal(args.length, 4);
    equal(args[0], "git");
    equal(args[1], "clone");
    equal(args[2], "--foo");
    equal(args[3], "bar");
});

test("exec::splat with command string", () => {
    const args = splat({
        "foo": "bar",
        splat: {
            command: "git clone",
        } as SplatOptions,
    });

    if (DEBUG) {
        console.log(args);
    }

    equal(args.length, 4);
    equal(args[0], "git");
    equal(args[1], "clone");
    equal(args[2], "--foo");
    equal(args[3], "bar");
});

test("exec::splat with command symbol string", () => {
    const args = splat({
        "foo": "bar",
        [SplatSymbols.command]: "git clone",
    });

    if (DEBUG) {
        console.log(args);
    }

    equal(args.length, 4);
    equal(args[0], "git");
    equal(args[1], "clone");
    equal(args[2], "--foo");
    equal(args[3], "bar");
});

test("exec::splat with command symbol array", () => {
    const args = splat({
        "foo": "bar",
        [SplatSymbols.command]: ["git", "clone"],
    });

    if (DEBUG) {
        console.log(args);
    }

    equal(args.length, 4);
    equal(args[0], "git");
    equal(args[1], "clone");
    equal(args[2], "--foo");
    equal(args[3], "bar");
});

test("exec::splat with arguments", () => {
    const args = splat({
        "foo": "bar",
        splat: {
            argumentNames: ["foo"],
        } as SplatOptions,
    });

    equal(args.length, 1);
    equal(args[0], "bar");
});

test("exec::splat with symbol argument names", () => {
    const args = splat({
        "foo": "bar",
        [SplatSymbols.argNames]: ["foo"],
    });

    equal(args.length, 1);
    equal(args[0], "bar");
});

test("exec::splat with symbol arguments", () => {
    const args = splat({
        [SplatSymbols.args]: ["foo", "bar"],
        "foo": "bar",
    });

    equal(args.length, 4);
    equal(args[0], "foo");
    equal(args[1], "bar");
    equal(args[2], "--foo");
    equal(args[3], "bar");
});

Deno.test("exec::splat with appended arguments", () => {
    const args = splat({
        "foo": "bar",
        "test": "baz",
        splat: {
            argumentNames: ["foo"],
            appendArguments: true,
        } as SplatOptions,
    });

    equal(args.length, 3);
    equal(args[0], "--test");
    equal(args[1], "baz");
    equal(args[2], "bar");
});

Deno.test("exec::splat with symbol appended arguments", () => {
    const args = splat({
        [SplatSymbols.args]: ["bar"],
        "test": "baz",
        splat: {
            appendArguments: true,
        } as SplatOptions,
    });

    equal(args.length, 3);
    equal(args[0], "--test");
    equal(args[1], "baz");
    equal(args[2], "bar");
});

Deno.test("exec::splat with symbol remaining args", () => {
    const args = splat({
        [SplatSymbols.remainingArgs]: ["bar"],
        "test": "baz",
    });

    equal(args.length, 3);
    equal(args[0], "--test");
    equal(args[1], "baz");
    equal(args[2], "bar");
});

Deno.test("exec::splat with remaining args", () => {
    const args = splat({
        ["_"]: ["bar"],
        "test": "baz",
    });

    equal(args.length, 3);
    equal(args[0], "--test");
    equal(args[1], "baz");
    equal(args[2], "bar");
});

Deno.test("exec::splat: noFlags", () => {
    const args = splat({
        "force": true,
        "other": true,
        splat: {
            noFlags: ["force"],
        } as SplatOptions,
    });

    equal(args.length, 3);
    equal(args[0], "--force");
    equal(args[1], "true");
    equal(args[2], "--other");
});

Deno.test("exec::splat: noFlagsValues", () => {
    const args = splat({
        "force": false,
        "other": true,
        splat: {
            noFlags: ["force"],
            noFlagValues: { t: "1", f: "2" },
        } as SplatOptions,
    });

    equal(args.length, 3);
    equal(args[0], "--force");
    equal(args[1], "2");
    equal(args[2], "--other");
});

Deno.test("exec::splat with symbol extra args", () => {
    const args = splat({
        [SplatSymbols.extraArgs]: ["bar", "--flag"],
        "test": "baz",
    });

    equal(args.length, 5);
    equal(args[0], "--test");
    equal(args[1], "baz");
    equal(args[2], "--");
    equal(args[3], "bar");
    equal(args[4], "--flag");
});

Deno.test("exec::splat with extra args", () => {
    const args = splat({
        ["--"]: ["bar", "--flag"],
        "test": "baz",
    });

    equal(args.length, 5);
    equal(args[0], "--test");
    equal(args[1], "baz");
    equal(args[2], "--");
    equal(args[3], "bar");
    equal(args[4], "--flag");
});

Deno.test("exec::splat with positional args", () => {
    const args = splat({
        "*": ["one", "two"],
        "test": "baz",
    });

    equal(args.length, 4);
    equal(args[0], "one");
    equal(args[1], "two");
    equal(args[2], "--test");
    equal(args[3], "baz");
});
