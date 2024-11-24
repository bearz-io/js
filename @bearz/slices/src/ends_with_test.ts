import { equal } from "@bearz/assert";
import { endsWith, endsWithFold } from "./ends_with.ts";

const test = Deno.test;

test("slices::endsWithFold", () => {
    const tests = [
        { input: "hello world", test: "world", result: true },
        { input: "hello world", test: "world ", result: false },
        { input: "hello world", test: "WORLD", result: true },
        { input: "hello world", test: "WORLD ", result: false },
        { input: "hello WOrLD", test: "world", result: true },
        { input: "hello WÖrLD", test: "wörld", result: true },
    ];

    for (const { input, test, result } of tests) {
        const actual = endsWithFold(input, test);
        equal(actual, result);
    }
});

test("slices::endsWith", () => {
    const tests = [
        { input: "hello world", test: "world", result: true },
        { input: "hello world", test: "world ", result: false },
        { input: "hello world", test: "WORLD", result: false },
        { input: "hello world", test: "WORLD ", result: false },
        { input: "hello WOrLD", test: "world", result: false },
        { input: "hello WÖrLD", test: "wörld", result: false },
        { input: "hello wörld", test: "wörld", result: true },
    ];

    for (const { input, test, result } of tests) {
        const actual = endsWith(input, test);
        equal(actual, result);
    }
});
