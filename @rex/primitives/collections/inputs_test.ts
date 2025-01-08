import { exists, ok } from "@bearz/assert";
import { Inputs } from "./inputs.ts";

const test = Deno.test;

test("@rex/primitives::Inputs ctor does not throw", () => {
    const inputs = new Inputs();
    exists(inputs);
    ok(inputs instanceof Inputs);
});
