import { equal } from "./equal.ts";

const test = Deno.test;

test("asserts::equal", () => {
    equal(1, 1);
    equal(1, 1.0);
    equal("1", "1");
    equal(true, true);
    equal(false, false);
    equal(null, null);
    equal(undefined, undefined);
});