import { equal } from "@bearz/assert";
import { trim, trimEnd, trimStart } from "./trim.ts";

const test = Deno.test;

test("slices::trim", () => {
    const tests = [
        { input: "  hello world  ", result: "hello world", chars: undefined },
        { input: "  hello world \n", result: "hello world \n", chars: " " },
        { input: "hello world", result: "hello worl", chars: "d" },
        { input: "hello world", result: "ello worl", chars: "dh" },
    ];

    let i = 0;
    for (const { input, result, chars } of tests) {
        const actual = String.fromCodePoint(...trim(input, chars));
        console.log(i, input, actual, result);
        equal(actual, result);
        i++;
    }
});

test("slices::trimEnd", () => {
    const tests = [
        { input: "  hello world  ", result: "  hello world", chars: undefined },
        { input: "  hello world \n", result: "  hello world \n", chars: " " },
        { input: "  hello world  ", result: "  hello world", chars: " " },
        { input: "hello world", result: "hello worl", chars: "d" },
        { input: "hello world", result: "hello worl", chars: "dh" },
    ];

    let i = 0;
    for (const { input, result, chars } of tests) {
        const actual = String.fromCodePoint(...trimEnd(input, chars));
        console.log(i, input, actual, result);
        equal(actual, result);
        i++;
    }
});

test("slices::trimStart", () => {
    const tests = [
        { input: "  hello world  ", result: "hello world  ", chars: undefined },
        { input: "\n  hello world  ", result: "\n  hello world  ", chars: " " },
        { input: "  hello world  ", result: "hello world  ", chars: " " },
        { input: "hello world", result: "ello world", chars: "h" },
        { input: "hello world", result: "ello world", chars: "dh" },
    ];

    let i = 0;
    for (const { input, result, chars } of tests) {
        const actual = String.fromCodePoint(...trimStart(input, chars));
        console.log(i, input, actual, result);
        equal(actual, result);
        i++;
    }
});
