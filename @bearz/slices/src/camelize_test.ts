import { equal } from "@bearz/assert";
import { camelize } from "./camelize.ts";

Deno.test("slices::camelize", () => {
    const tests = [
        ["hello_world", "helloWorld"],
        ["hello-world", "helloWorld"],
        ["hello world", "helloWorld"],
        ["helloWorld", "helloWorld"],
        ["helloWorld123", "helloWorld123"],
        ["hello123World", "hello123World"],
    ];

    for (const [input, expected] of tests) {
        const actual = String.fromCodePoint(...camelize(input));
        equal(actual, expected);
    }

    const test2 = [
        ["hello_world", "helloWorld"],
        ["hello-world", "helloWorld"],
        ["hello world", "helloWorld"],
        ["helloWorld", "helloWorld"],
        ["helloWorld123", "helloWorld123"],
        ["hello123World", "hello123World"],
    ];

    for (const [input, expected] of test2) {
        const actual = String.fromCodePoint(...camelize(input, { preserveCase: true }));
        equal(actual, expected);
    }
});
