import { ok } from "@bearz/assert";
import { endsWithFold } from "./ends_with.ts";

Deno.test("strings::endsWithFold", () => {
    ok(endsWithFold("sdfsdf Hello", "hello"));
    ok(endsWithFold("Hello", "HELLO"));
});
