import { ok } from "./ok.ts";
const test = Deno.test;

test("asserts::ok", () => {
    ok(true);
    ok(1);
    ok("1");
});
