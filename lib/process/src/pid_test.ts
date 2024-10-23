import { ok } from "@bearz/assert";
import { pid } from "./pid.ts";
import { NODELIKE } from "@bearz/runtime-info/js";

const test = Deno.test;

test("process::pid", () => {
    if (NODELIKE) {
        ok(pid > 0);
    } else {
        ok(pid === 0);
    }
});
