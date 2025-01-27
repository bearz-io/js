import { equal, instanceOf, ok } from "@bearz/assert";
import { PanicError } from "./panic_error.ts";

const { test } = Deno;

test("errors::PanicError - should create with default message", () => {
    const error = new PanicError();
    equal(error.message, "An unexpected error occurred.");
    equal(error.name, "PanicError");
    instanceOf(error, Error);
    instanceOf(error, PanicError);
});

test("errors::PanicError - should create with custom message", () => {
    const error = new PanicError("Test error");
    equal(error.message, "Test error");
    equal(error.name, "PanicError");
});

test("errors::PanicError.is - should identify PanicError instances", () => {
    const error = new PanicError();
    ok(PanicError.is(error));
});

test("errors::PanicError.is - should identify Error instances with PanicError name", () => {
    const error = new Error();
    error.name = "PanicError";
    ok(PanicError.is(error));
});

test("errors::PanicError.is - should reject non-PanicError instances", () => {
    const error = new Error();
    equal(PanicError.is(error), false);
    equal(PanicError.is({}), false);
    equal(PanicError.is(null), false);
    equal(PanicError.is(undefined), false);
});
