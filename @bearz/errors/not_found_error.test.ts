import { equal, ok } from "@bearz/assert";
import { NotFoundError } from "./not_found_error.ts";

const { test } = Deno;

test("errors::NotFoundError - should create error with options", () => {
    const error = new NotFoundError({ resource: "test.txt" });
    equal(error.message, "Resource test.txt not found.");
    equal(error.resource, "test.txt");
    equal(error.name, "NotFoundError");
});

test("errors::NotFoundError - should create error with message and options", () => {
    const error = new NotFoundError("Custom message", { resource: "test.txt" });
    equal(error.message, "Custom message");
    equal(error.resource, "test.txt");
    equal(error.name, "NotFoundError");
});

test("errors::NotFoundError - should create error without resource", () => {
    const error = new NotFoundError({});
    equal(error.message, "Resource not found.");
    equal(error.resource, undefined);
    equal(error.name, "NotFoundError");
});

test("errors::NotFoundError - static is() should identify NotFoundError instances", () => {
    const error = new NotFoundError({});
    ok(NotFoundError.is(error));

    const genericError = new Error();
    genericError.name = "NotFoundError";
    ok(NotFoundError.is(genericError));

    const regularError = new Error();
    ok(!NotFoundError.is(regularError));
});
