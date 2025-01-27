import { Lazy, lazy } from "./lazy.ts";
import { equal, nope, ok } from "@bearz/assert";

const { test } = Deno;

test("functional::Lazy - should not compute value until accessed", () => {
    let computed = false;
    const l = new Lazy(() => {
        computed = true;
        return 42;
    });

    nope(computed);
    nope(l.hasValue);
});

test("functional::Lazy - should compute and cache value when accessed", () => {
    let computeCount = 0;
    const l = new Lazy(() => {
        computeCount++;
        return 42;
    });

    equal(l.value, 42);
    equal(computeCount, 1);
    ok(l.hasValue);

    // Second access should use cached value
    equal(l.value, 42);
    equal(computeCount, 1);
    ok(l.hasValue);
});

test("functional::lazy - helper function should create Lazy instance", () => {
    const l = lazy(() => 42);
    equal(l.value, 42);
    ok(l.hasValue);
});

test("functional::Lazy - should handle undefined values", () => {
    const l = new Lazy(() => undefined);
    nope(l.hasValue);
    equal(l.value, undefined);
    nope(l.hasValue);
});
