import { equal, instanceOf, ok, throws } from "@bearz/assert";
import {
    featureNotImplemented,
    functionNotImplemented,
    NotImplementedError,
} from "./not_implemented_error.ts";

const { test } = Deno;

test("errors::NotImplementedError - should create with default message", () => {
    const error = new NotImplementedError();
    equal(error.message, "Feature not implemented.");
    equal(error.name, "NotImplementedError");
    equal(error.link, "https://jsr.io/@bearz/errors/docs/not-implemented-error");
    ok(NotImplementedError.is(error));
});

test("errors::NotImplementedError - should create with custom message", () => {
    const error = new NotImplementedError("Custom message");
    equal(error.message, "Custom message");
    equal(error.name, "NotImplementedError");
});

test("errors::NotImplementedError - should create with options", () => {
    const error = new NotImplementedError({
        target: "TestFeature",
        link: "custom-link",
    });
    instanceOf(error, NotImplementedError);
    equal(error.message, "Feature TestFeature not implemented.");
    equal(error.target, "TestFeature");
    equal(error.link, "custom-link");
});

test("errors::NotImplementedError - should identify instances correctly", () => {
    const error = new NotImplementedError();
    ok(NotImplementedError.is(error));

    const generic = new Error();
    generic.name = "NotImplementedError";
    ok(NotImplementedError.is(generic));
});

test("errors::featureNotImplemented - should throw NotImplementedError", () => {
    throws(() => {
        featureNotImplemented("TestFeature");
    }, NotImplementedError);
});

test("errors::functionNotImplemented - should throw NotImplementedError", () => {
    throws(() => {
        functionNotImplemented();
    }, NotImplementedError);
});
