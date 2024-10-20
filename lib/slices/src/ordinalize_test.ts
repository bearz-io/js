import { equal } from "@bearz/assert";
import { ordinalize } from "./ordinalize.ts";

const test = Deno.test;

test("slices::ordinalize", () => {
    const tests = [
        { input: "hello world", result: "hello world" },
        { input: "HelloWorld", result: "HelloWorld" },
        { input: "helloWorld", result: "helloWorld" },
        { input: "1", result: "1st" },
        { input: "2", result: "2nd" },
        { input: "3", result: "3rd" },
        { input: "4", result: "4th" },
        { input: "5", result: "5th" },
        { input: "6", result: "6th" },
        { input: "7", result: "7th" },
        { input: "8", result: "8th" },
        { input: "9", result: "9th" },
        { input: "10", result: "10th" },
        { input: "11", result: "11th" },
        { input: "22", result: "22nd" },
        { input: "33", result: "33rd" },
        { input: "44", result: "44th" },
        { input: "55", result: "55th" },
        { input: "On the 1 day", result: "On the 1st day" },
    ];

    let i = 0;
    for (const { input, result } of tests) {
        const actual = String.fromCodePoint(...ordinalize(input));
        console.log(i, actual, result);
        equal(actual, result);
        i++;
    }
});
