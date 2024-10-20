import { equal } from "@bearz/assert";
import { pascalize } from "./pascalize.ts";

const test = Deno.test;

test("slices::pascalize", () => {
    const tests = [
        { input: "hello world", result: "HelloWorld" },
        { input: "HelloWorld", result: "Helloworld" },
        { input: "helloWorld", result: "Helloworld" },

        { input: "hello wörld", result: "HelloWörld" },
        { input: "helloWörld", result: "Hellowörld" },
        { input: "hello WÖrLD", result: "HelloWörld" },
    ];

    let i = 0;
    for (const { input, result } of tests) {
        const actual = String.fromCodePoint(...pascalize(input));
        console.log(i, input, actual, result);
        equal(actual, result);
        i++;
    }
});
