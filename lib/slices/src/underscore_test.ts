import { equal, throws } from "@bearz/assert";
import { underscore } from "./underscore.ts";

const test = Deno.test;

test("slices::underscore - error", () => {
    throws(() => {
        underscore("hello world", { preserveCase: true, screaming: true });
    });
});

test("slices::underscore", () => {
    const tests = [
        { input: "hello world", result: "hello_world" },
        { input: "HelloWorld", result: "hello_world" },
        { input: "helloWorld", result: "hello_world" },
        { input: "hello world", preserveCase: true, result: "hello_world" },
        { input: "hello world", screaming: true, result: "HELLO_WORLD" },
        { input: "hello wörld", result: "hello_wörld" },
        { input: "helloWörld", result: "hello_wörld" },
        { input: "hello wörld", preserveCase: true, result: "hello_wörld" },
        { input: "hello wörld", screaming: true, result: "HELLO_WÖRLD" },
        { input: "hello wörld", screaming: true, result: "HELLO_WÖRLD" },
        { input: "hello WÖrLD", result: "hello_wör_ld" },
        { input: "hello WÖrLD", preserveCase: true, result: "hello_WÖr_LD" },
        { input: "hello", result: "hello" },
        { input: "hello", preserveCase: true, result: "hello" },
        { input: "hello", screaming: true, result: "HELLO" },
    ];

    let i = 0;
    for (const { input, result, preserveCase, screaming } of tests) {
        const actual = String.fromCodePoint(...underscore(input, { preserveCase, screaming }));
        console.log(i, input, actual, result);
        equal(actual, result);
        i++;
    }
});
