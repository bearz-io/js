import { equal, instanceOf, ok as assert } from "@bearz/assert";
import { NotFoundError } from "@bearz/errors/not-found";
import { AbortError } from "@bearz/errors/abort";
import { TimeoutError } from "@bearz/errors/timeout";
import { PanicError } from "@bearz/errors/panic";
import { fail } from "./result.ts";
import { abort, aborted, failAsError, isPanic, notFound, timedout } from "./errors.ts";

const { test } = Deno;

test("functional::failAsError - returns Err with Error instance", () => {
    const error = new Error("test");
    const result = failAsError(error);
    assert(result.isError);
    equal(result.unwrapError(), error);
});

test("functional::failAsError - coerces non-Error to Error", () => {
    const result = failAsError("test message");
    assert(result.isError);
    instanceOf(result.unwrapError(), Error);
    equal(result.unwrapError().message, "Unexpected error: test message");
});

test("functional::notFound - detects NotFoundError", () => {
    const result = fail(new NotFoundError());
    assert(notFound(result));
});

test("functional::timedout - detects TimeoutError", () => {
    const result = fail(new TimeoutError());
    assert(timedout(result));
});

test("functional::aborted - detects AbortError", () => {
    const result = fail(new AbortError());
    assert(aborted(result));
});

test("functional::isPanic - detects PanicError", () => {
    const result = fail(new PanicError());
    assert(isPanic(result));
});

test("functional::abort - creates AbortError result with signal", () => {
    const controller = new AbortController();
    const result = abort(controller.signal);
    assert(result.isError);
    instanceOf(result.unwrapError(), AbortError);
});

test("functional::abort - uses existing AbortError reason", () => {
    const controller = new AbortController();
    const abortError = new AbortError("test abort");
    controller.abort(abortError);
    const result = abort(controller.signal);
    assert(result.isError);
    equal(result.unwrapError(), abortError);
});

test("functional::abort - wraps Error reason in AbortError", () => {
    const controller = new AbortController();
    const error = new Error("test error");
    controller.abort(error);
    const result = abort(controller.signal);
    assert(result.isError);
    instanceOf(result.unwrapError(), AbortError);
    equal(result.unwrapError().cause, error);
});
