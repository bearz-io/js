import { equal } from "@bearz/assert";
import { titleize } from "./titleize.ts";

const test = Deno.test;

test("slices::titleize", () => {
    const tests = [
        { input: "hello world", result: "Hello World" },
        { input: "HelloWorld", result: "Hello World" },
        { input: "helloWorld", result: "Hello World" },
        { input: "hello wörld", result: "Hello Wörld" },
        { input: "helloWörld", result: "Hello Wörld" },
        // not what you want, but titleize is for converting code.
        { input: "hello WÖrLD", result: "Hello Wör Ld" },
        { input: "hello", result: "Hello" },
        { input: "BobTheKing", result: "Bob the King" },
        { input: "bob_the_king", result: "Bob the King" },
    ];

    let i = 0;
    for (const { input, result } of tests) {
        const actual = String.fromCodePoint(...titleize(input));
        console.log(i, input, actual, result);
        equal(actual, result);
        i++;
    }
});
