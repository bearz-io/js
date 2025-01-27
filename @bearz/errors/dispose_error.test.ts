import { equal, instanceOf } from "@bearz/assert";
import { DisposedError } from "./disposed_error.ts";

const { test } = Deno;

test("errors::DisposedError - should create error with default message", () => {
    const error = new DisposedError();
    equal(error.message, "Object already disposed.");
    equal(error.name, "DisposedError");
    equal(error.link, "https://jsr.io/@bearz/errors/docs/disposed-error");
    instanceOf(error, DisposedError);
    instanceOf(error, Error);
});

test("errors::DisposedError - should create error with custom message", () => {
    const error = new DisposedError("Custom message");
    equal(error.message, "Custom message");
});

test("errors::DisposedError - should create error with target", () => {
    const error = new DisposedError({ target: "TestObject" });
    equal(error.message, "Object TestObject already disposed.");
    equal(error.target, "TestObject");
});

test("errors::DisposedError - should create error with custom link", () => {
    const error = new DisposedError({ link: "https://custom-link" });
    equal(error.link, "https://custom-link");
});

test("errors::DisposedError - should create error with all options", () => {
    const error = new DisposedError("Custom message", {
        target: "TestObject",
        link: "https://custom-link",
    });
    equal(error.message, "Custom message");
    equal(error.target, "TestObject");
    equal(error.link, "https://custom-link");
});
