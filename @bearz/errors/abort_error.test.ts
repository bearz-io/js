import { AbortError } from "./abort_error.ts";
import { equal, instanceOf, nope, ok, throws } from "@bearz/assert";

const { test } = Deno;

test("errors::AbortError - should create an instance with a custom message", () => {
    const error = new AbortError("Custom abort message");
    instanceOf(error, AbortError);
    equal(error.message, "Custom abort message");
    equal(error.link, "https://jsr.io/@bearz/errors/docs/abort-error");
});

test("errors::AbortError - should create an instance with a default message", () => {
    const error = new AbortError();
    instanceOf(error, AbortError);
    equal(error.message, "The operation was cancelled.");
    equal(error.link, "https://jsr.io/@bearz/errors/docs/abort-error");

    const error2 = new AbortError({ target: "action" });
    instanceOf(error2, AbortError);
    equal(error2.message, "The operation action was cancelled.");
});

test("errors::AbortError - should correctly identify an AbortError instance", () => {
    const error = new AbortError("Test abort error");
    ok(AbortError.is(error));
    nope(AbortError.is(new Error("Test abort error")));
});

test("errors::AbortError - should throw an AbortError with the specified message", () => {
    throws(
        () => {
            throw new AbortError("Operation aborted");
        },
        AbortError,
        "Operation aborted",
    );
});

test("errors::AbortError - should have a link property", () => {
    const error = new AbortError("Test abort error");
    equal(error.link, "https://jsr.io/@bearz/errors/docs/abort-error");
});

test("errors::AbortError - should have a name property set to 'AbortError'", () => {
    const error = new AbortError("Test abort error");
    equal(error.name, "AbortError");
});
