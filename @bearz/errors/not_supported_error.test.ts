import { equal, instanceOf, nope, ok } from "@bearz/assert";
import { NotSupportedError } from "./not_supported_error.ts";

const { test } = Deno;

test("errors::NotSupportedError - should create with default message", () => {
    const error = new NotSupportedError();
    instanceOf(error, NotSupportedError);
    equal(error.message, "Platform not supported.");
    equal(error.name, "NotSupportedError");
    ok(error instanceof Error);
});

test("errors::NotSupportedError - should create with custom message", () => {
    const error = new NotSupportedError("Custom message");
    equal(error.message, "Custom message");
});

test("errors::NotSupportedError - should create with options", () => {
    const error = new NotSupportedError({
        target: "Windows",
        link: "https://example.com",
    });
    equal(error.message, "Platform Windows not supported.");
    equal(error.target, "Windows");
    equal(error.link, "https://example.com");
});

test("errors::NotSupportedError - should create with message and options", () => {
    const error = new NotSupportedError("Custom message", {
        target: "Linux",
        link: "https://example.com",
    });
    equal(error.message, "Custom message");
    equal(error.target, "Linux");
    equal(error.link, "https://example.com");
});

test("errors::NotSupportedError - static is() should identify instances", () => {
    const error = new NotSupportedError();
    ok(NotSupportedError.is(error));
    nope(NotSupportedError.is(new Error()));
    nope(NotSupportedError.is(null));
    nope(NotSupportedError.is(undefined));
});
