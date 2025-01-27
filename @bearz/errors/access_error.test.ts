import { AccessError } from "./access_error.ts";
import { equal, instanceOf, nope, ok, throws } from "@bearz/assert";

const { test } = Deno;

test("errors::AccessError - should create an instance with a custom message", () => {
    const error = new AccessError("Custom access error message", { target: "file.txt" });
    instanceOf(error, AccessError);
    equal(error.message, "Custom access error message");
    equal(error.target, "file.txt");
    equal(error.link, "https://jsr.io/@bearz/errors/docs/access-error");
});

test("errors::AccessError - should create an instance with a default message", () => {
    const error = new AccessError({ target: "file.txt" });
    instanceOf(error, AccessError);
    equal(error.message, "Access error.");
    equal(error.target, "file.txt");
    equal(error.link, "https://jsr.io/@bearz/errors/docs/access-error");
});

test("errors::AccessError - should correctly identify an AccessError instance", () => {
    const error = new AccessError("Test access error");
    ok(AccessError.is(error));
    nope(AccessError.is(new Error("Test access error")));
});

test("errors::AccessError - should throw an AccessError with the specified message", () => {
    throws(
        () => {
            throw new AccessError("Access denied");
        },
        AccessError,
        "Access denied",
    );
});

test("errors::AccessError - should have a link property", () => {
    const error = new AccessError("Test access error");
    equal(error.link, "https://jsr.io/@bearz/errors/docs/access-error");
});

test("errors::AccessError - should have a name property set to 'AccessError'", () => {
    const error = new AccessError("Test access error");
    equal(error.name, "AccessError");
});
