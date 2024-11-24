import { processElevated } from "./mod.ts";
import { exists } from "@bearz/assert";

const test = Deno.test;

test("process-elevated::processElevated does not throw", () => {
    const elevated = processElevated();
    console.log(`process elevated: ${elevated}`);
    exists(elevated);
});
