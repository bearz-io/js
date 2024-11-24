import { equal } from "@bearz/assert";
import { indexOfFold } from "./index_of.ts";

Deno.test("strings::indexOfFold", () => {
    equal(0, indexOfFold("Hello sdf", "hello"));
    equal(0, indexOfFold("Hello", "HELLO"));
    equal(7, indexOfFold("sdfsdf Hello", "hello"));
});
