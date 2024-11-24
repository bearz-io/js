import { equal } from "@bearz/assert";
import { printLn, setNoColor, sprintf } from "./printf.ts";

const test = Deno.test;

setNoColor(true);

test("fmt::sprintf", () => {
    const out = sprintf("Hello, %s!", "world");

    const o = sprintf("%I", { "a": 1, "b": 2 });
    equal(out, "Hello, world!");
    equal(o, "{ a: 1, b: 2 }");
    printLn("Hello", "world");
});
