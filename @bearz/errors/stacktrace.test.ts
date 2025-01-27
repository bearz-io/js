import { equal, ok, throws } from "@bearz/assert";
import { StackTrace } from "./stacktrace.ts";

const { test } = Deno;

test("errors::StackTrace - constructor creates empty frames array", () => {
    const trace = new StackTrace();
    equal(trace.length, 0);
});

test("errors::StackTrace - add() adds frame to trace", () => {
    const trace = new StackTrace();
    trace.add({ fileName: "test.ts", lineNumber: 1 });
    equal(trace.length, 1);
    equal(trace.at(0).fileName, "test.ts");
    equal(trace.at(0).lineNumber, 1);
});

test("errors::StackTrace - at() throws on invalid index", () => {
    const trace = new StackTrace();
    throws(() => trace.at(-1));
    throws(() => trace.at(0));
});

test("errors::StackTrace - removeAt() removes frame at index", () => {
    const trace = new StackTrace();
    trace.add({ fileName: "test1.ts" });
    trace.add({ fileName: "test2.ts" });
    trace.removeAt(0);
    equal(trace.length, 1);
    equal(trace.at(0).fileName, "test2.ts");
});

test("errors::StackTrace - fromTrace parses stack trace string", () => {
    const traceStr = `Error: test
    at functionName (/path/to/file.ts:10:5)
    at http://example.com:8000/test.ts:15:10`;

    const trace = StackTrace.fromTrace(traceStr);
    equal(trace.length, 2);

    const frame1 = trace.at(0);
    equal(frame1.functionName, "functionName");
    equal(frame1.fileName, "/path/to/file.ts");
    equal(frame1.lineNumber, 10);
    equal(frame1.columnNumber, 5);

    const frame2 = trace.at(1);
    equal(frame2.fileName, "http://example.com:8000/test.ts");
    equal(frame2.lineNumber, 15);
    equal(frame2.columnNumber, 10);
});

test("errors::StackTrace - fromError creates trace from Error", () => {
    const error = new Error("test error");
    const trace = StackTrace.fromError(error);
    ok(trace.length > 0);
});
