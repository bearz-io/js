import { equal } from "@bearz/assert";
import { splat, type SplatOptions } from "./splat.ts";

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

test("exec::splat with command", () => {
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

test("exec::splat with arguments", () => {
    const args = splat({
        "foo": "bar",
        splat: {
            arguments: ["foo"],
        } as SplatOptions,
    });

    equal(args.length, 1);
    equal(args[0], "bar");
});

Deno.test("exec::splat with appended arguments", () => {
    const args = splat({
        "foo": "bar",
        "test": "baz",
        splat: {
            arguments: ["foo"],
            appendArguments: true,
        } as SplatOptions,
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
