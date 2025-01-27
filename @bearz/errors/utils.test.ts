import { equal, nope, ok, throws } from "@bearz/assert";
import {
    isError,
    isNetworkError,
    isPanic,
    join,
    mixin,
    panic,
    panicIf,
    toError,
    walk,
} from "./utils.ts";
import { PanicError } from "./panic_error.ts";

const { test } = Deno;

test("errors::isError - returns true for Error instances", () => {
    ok(isError(new Error()));
    ok(isError(new TypeError()));
    nope(isError("not an error"));
    nope(isError({}));
});

test("errors::isNetworkError - detects network errors", () => {
    const networkError = new TypeError("network error");
    ok(isNetworkError(networkError));

    const fetchError = new TypeError("Failed to fetch");
    ok(isNetworkError(fetchError));

    const regularError = new Error("not a network error");
    nope(isNetworkError(regularError));
});

test("errors::toError - converts values to errors", () => {
    const error = new Error("test");
    equal(toError(error), error);

    const converted = toError("test message");
    ok(converted instanceof Error);
    equal(converted.message, "Unexpected error: test message");
});

test("errors::panic - throws PanicError", () => {
    throws(() => panic("test message"), PanicError);

    const error = new Error("original");
    try {
        panic(error);
    } catch (e) {
        ok(isPanic(e));
        equal(e.cause, error);
    }
});

test("errors::panicIf - conditionally throws PanicError", () => {
    throws(() => panicIf(true, "test"), PanicError);
    equal(panicIf(false, "test"), undefined);
});

test("errors::join - creates AggregateError", () => {
    const error1 = new Error("first");
    const error2 = new Error("second");

    const aggregate1 = join("message", error1, error2);
    ok(aggregate1 instanceof AggregateError);
    equal(aggregate1.message, "message");
    equal(aggregate1.errors.length, 2);

    const aggregate2 = join(error1, error2);
    ok(aggregate2 instanceof AggregateError);
    equal(aggregate2.errors.length, 2);
});

test("errors::mixin - adds properties to error", () => {
    const error = new Error("test");
    const mixed = mixin(error, { code: 404, status: "Not Found" });

    equal(mixed.message, "test");
    equal(mixed.code, 404);
    equal(mixed.status, "Not Found");
});

test("errors::walk - traverses error tree", () => {
    const leaf = new Error("leaf");
    const middle = new Error("middle");
    middle.cause = leaf;
    const root = new AggregateError([middle], "root");

    const errors: Error[] = [];
    walk(root, (e) => errors.push(e));

    equal(errors.length, 3);
    ok(errors.includes(leaf));
    ok(errors.includes(middle));
    ok(errors.includes(root));
});
