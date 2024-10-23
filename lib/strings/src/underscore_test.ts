import { equal } from "@bearz/assert";
import { underscore } from "./underscore.ts";

Deno.test("strings::underscore", () => {
    equal("hello_world", underscore("HelloWorld"));
    equal("hello_world", underscore("helloWorld"));
    equal("hello_world", underscore("hello_world"));
    equal("hello_world", underscore("hello-World"));
    equal("hello_world", underscore("HELLO-World"));

    equal("hello_world", underscore("hello world"));
    equal("hello_world", underscore("hello  world"));
    equal("hello_world", underscore("hello   world"));
    equal("hello_world", underscore("hello----world"));
    equal("hello_world", underscore("   helloWorld"));
    equal("HELLO_WORLD", underscore("hello world", { screaming: true }));
});
