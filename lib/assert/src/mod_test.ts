import { equal, ok, no } from "./mod.ts";

const test = Deno.test;



test("asserts::ok", () => {
    ok(true);
    ok(1);
    ok("1");
    ok(null);
    ok(undefined);
});

test("asserts::no", () => {
    no(false);
    no(0);
    no("");
    no(NaN);
    no(Infinity);
    no(-Infinity);
});