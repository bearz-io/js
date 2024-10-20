import { equal } from "@bearz/assert";
import { capitalize } from "./capitalize.ts";

Deno.test("slices::capitalize", () => {
    const tests = [
        ["hello", "Hello"],
        ["Hello", "Hello"],
        ["hello world", "Hello world"],
        ["helloWorld", "Helloworld"],
        ["helloWorld123", "Helloworld123"],
        ["hello123World", "Hello123world"],
    ];

    for (const [input, expected] of tests) {
        const actual = String.fromCodePoint(...capitalize(input));
        console.log(actual, expected);
        equal(actual, expected);
    }

    const test2 = [
        ["hello", "Hello"],
        ["Hello", "Hello"],
        ["hello world", "Hello world"],
        ["helloWorld", "HelloWorld"],
        ["helloWorld123", "HelloWorld123"],
        ["hello123World", "Hello123World"],
    ];

    for (const [input, expected] of test2) {
        const actual = String.fromCodePoint(...capitalize(input, { preserveCase: true }));
        equal(actual, expected);
    }
});
