import { equal } from "@bearz/assert";
import { stringify } from "./stringify.ts";
import { WINDOWS } from "@bearz/runtime-info/os";

const test = Deno.test;

test("dotenv::stringifyDocument", () => {
    const env = {
        "FOO": "bar",
        "BAR": "baz\n",
    }
   

    const source = stringify(env);
    let expected = `FOO='bar'
BAR="baz
"`;
    if (WINDOWS) {
        expected = expected.replace(/\n/g, "\r\n");
    }

    equal(source, expected);
});
