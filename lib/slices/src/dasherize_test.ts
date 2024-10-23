import { equal, throws } from "@bearz/assert";
import { dasherize } from "./dasherize.ts";

const test = Deno.test;

test("slices::dasherize - error", () => {
    throws(() => {
        dasherize("hello world", { preserveCase: true, screaming: true });
    });
});

test("slices::dasherize", () => {
    const tests = [
        { input: "hello world", result: "hello-world" },
        { input: "HelloWorld", result: "hello-world" },
        { input: "helloWorld", result: "hello-world" },
        { input: "hello world", preserveCase: true, result: "hello-world" },
        { input: "hello world", screaming: true, result: "HELLO-WORLD" },
        { input: "hello wörld", result: "hello-wörld" },
        { input: "helloWörld", result: "hello-wörld" },
        { input: "hello wörld", preserveCase: true, result: "hello-wörld" },
        { input: "hello wörld", screaming: true, result: "HELLO-WÖRLD" },
        { input: "hello wörld", screaming: true, result: "HELLO-WÖRLD" },
        { input: "hello WÖrLD", result: "hello-wör-ld" },
        { input: "hello WÖrLD", preserveCase: true, result: "hello-WÖr-LD" },
        { input: "hello", result: "hello" },
        { input: "hello", preserveCase: true, result: "hello" },
        { input: "hello", screaming: true, result: "HELLO" },
    ];

    let i = 0;
    for (const { input, result, preserveCase, screaming } of tests) {
        const actual = String.fromCodePoint(...dasherize(input, { preserveCase, screaming }));
        console.log(i, input, actual, result);
        equal(actual, result);
        i++;
    }
});
