import { equal, instanceOf, ok } from "@bearz/assert";
import { TimeoutError } from "./timeout_error.ts";

const { test } = Deno;

test("errors::TimeoutError - should create with default message", () => {
    const error = new TimeoutError();
    equal(error.message, "Operation timed out.");
    equal(error.name, "TimeoutError");
    ok(!error.timeout);
    ok(!error.target);
    ok(!error.link);
    instanceOf(error, Error);
});

test("errors::TimeoutError - should create with custom message", () => {
    const error = new TimeoutError("Custom timeout");
    equal(error.message, "Custom timeout");
});

test("errors::TimeoutError - should create with options", () => {
    const error = new TimeoutError({
        timeout: 5000,
        target: "http request",
        link: "https://example.com/timeout",
    });
    equal(error.message, "Operation http request timed out.");
    equal(error.timeout, 5000);
    equal(error.target, "http request");
    equal(error.link, "https://example.com/timeout");
});

test("errors::TimeoutError - should create with message and options", () => {
    const error = new TimeoutError("Custom message", {
        timeout: 3000,
        target: "database",
    });
    equal(error.message, "Custom message");
    equal(error.timeout, 3000);
    equal(error.target, "database");
});

test("errors::TimeoutError - static is() should identify TimeoutError instances", () => {
    const error = new TimeoutError();
    ok(TimeoutError.is(error));
    ok(!TimeoutError.is(new Error()));
    ok(!TimeoutError.is(null));
    ok(!TimeoutError.is(undefined));
});
