import { equal } from "@bearz/assert";
import { camelize } from "./camelize.ts";

const test = Deno.test;

test("strings::camelize", () => {
    const tests = [
        { input: "hello world", result: "helloWorld" },
        { input: "HelloWorld", result: "helloWorld" },
        { input: "hello_world", result: "helloWorld" },
        { input: "hello wörld", result: "helloWörld" },
        { input: "HelloWörld", result: "helloWörld" },
        { input: "hello wöRLd", preserveCase: true, result: "helloWöRLd" },
    ];

    let i = 0;
    for (const { input, result, preserveCase } of tests) {
        const actual = camelize(input, { preserveCase });
        console.log(i, input, actual, result);
        equal(actual, result);
        i++;
    }
});
