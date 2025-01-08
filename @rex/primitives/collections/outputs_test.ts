import { exists, ok } from "@bearz/assert";
import { Outputs } from "./outputs.ts";

const test = Deno.test;

test("@rex/primitives::Outputs ctor does not throw", () => {
    const outputs = new Outputs();
    exists(outputs);
    ok(outputs instanceof Outputs);
});
