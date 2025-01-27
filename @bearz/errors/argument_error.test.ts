import { ArgumentError, argumentError, throwOnEmpty, throwOnNull } from "./argument_error.ts";
import { equal, instanceOf, nope, ok, throws } from "@bearz/assert";

const { test } = Deno;

test("errors::ArgumentError -  should create an instance with a custom message", () => {
    const error = new ArgumentError("Custom error message", { target: "username" });
    instanceOf(error, ArgumentError);
    equal(error.message, "Custom error message");
    equal(error.target, "username");
    equal(error.link, "https://jsr.io/@bearz/errors/docs/argument-error");
});

test("errors::ArgumentError -  should create an instance with a default message", () => {
    const error = new ArgumentError({ target: "username" });
    instanceOf(error, ArgumentError);
    equal(error.message, "Invalid argument username.");
    equal(error.target, "username");
    equal(error.link, "https://jsr.io/@bearz/errors/docs/argument-error");

    const error2 = new ArgumentError();
    instanceOf(error2, ArgumentError);
    equal(error2.message, "Invalid argument.");
});

test("errors::ArgumentError -  should correctly identify an ArgumentError instance", () => {
    const error = new ArgumentError("Test error");
    ok(ArgumentError.is(error));
    nope(ArgumentError.is(new Error("Test error")));
});

test("errors::ArgumentError -  should throw an ArgumentError with the specified message", () => {
    throws(
        () => argumentError("username", "Username cannot be empty"),
        ArgumentError,
        "Username cannot be empty",
    );
});

test("errors::ArgumentError -  should throw an ArgumentError when argument is null or undefined", () => {
    throws(
        () => throwOnNull("username"),
        ArgumentError,
        "Argument username cannot be null or undefined.",
    );
});

test("errors::ArgumentError -  should throw an ArgumentError when argument is empty", () => {
    throws(
        () => throwOnEmpty("username"),
        ArgumentError,
        "Argument username cannot be empty.",
    );
});
