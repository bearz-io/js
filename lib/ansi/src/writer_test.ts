import { writer } from "./writer.ts";
import { apply, bgBlue, bold, green } from "./styles.ts";

Deno.test("writer", () => {
    writer.write("Hello, World!").writeLine();
    writer.debug("Hello, World!");
    writer.info("Hello, World!");
    writer.success("Hello, World!");
    writer.writeLine(apply("Hello, World!", bold, green, bgBlue) + " test");
});
