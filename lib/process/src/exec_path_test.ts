import { exists, ok } from "@bearz/assert";
import { NODELIKE } from "@bearz/runtime-info/js";
import { execPath } from "./exec_path.ts";

const test = Deno.test;

test("process::execPath", () => {
    exists(execPath);
    if (NODELIKE) {
        ok(execPath.length > 0);
    } else {
        ok(execPath.length === 0);
    }
});
