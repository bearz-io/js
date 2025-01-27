import { equal, instanceOf, ok } from "@bearz/assert";
import { ValidationError } from "./validation_error.ts";

const { test } = Deno;

test("errors::ValidationError - should create with default message", () => {
    const error = new ValidationError();
    equal(error.message, "Rule is invalid.");
    equal(error.name, "ValidationError");
});

test("errors::ValidationError - should create with custom message", () => {
    const error = new ValidationError("Custom message");
    equal(error.message, "Custom message");
});

test("errors::ValidationError - should create with options", () => {
    const error = new ValidationError({
        target: "email",
        rule: "format",
        value: "invalid-email",
    });

    equal(error.message, "email is invalid.");
    equal(error.target, "email");
    equal(error.rule, "format");
    equal(error.value, "invalid-email");
});

test("errors::ValidationError - should create with message and options", () => {
    const error = new ValidationError("Invalid email format", {
        target: "email",
        rule: "format",
        value: "invalid-email",
    });

    equal(error.message, "Invalid email format");
    equal(error.target, "email");
    equal(error.rule, "format");
    equal(error.value, "invalid-email");
});

test("errors::ValidationError - should check instance with is()", () => {
    const error = new ValidationError();
    ok(ValidationError.is(error));
    instanceOf(error, ValidationError);
});
