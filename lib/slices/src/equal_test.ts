import { equal } from "@bearz/assert";
import { equalFold } from "./equal.ts";

const test = Deno.test;

test("slices::equalFold", () => {
    const tests = [
        { input: "hello", test: "hello", result: true },
        { input: "hello", test: "HELLO", result: true },
        { input: "HELLO", test: "hello", result: true },
        { input: "hello", test: "HELLO", result: true },
        { input: "WÖrLD", test: "wörld", result: true },
        { input: "hello WÖrLD", test: "Hello wörld", result: true },
        { input: "hello WÖrLD", test: "Hello wörld ", result: false },
        { input: " hello WÖrLD ", test: "Hello wörld", result: false },
    ];

    let i = 0;
    for (const { input, test, result } of tests) {
        const actual = equalFold(input, test);
        console.log(i, input, test, actual, result);
        equal(actual, result);
        i++;
    }
});
