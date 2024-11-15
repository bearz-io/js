import { writer } from "./writer.ts";
import { apply, bgBlue, bold, green } from "./styles.ts";
import { AnsiLogLevel } from "./enums.ts";

Deno.test("writer", () => {
    writer.level = AnsiLogLevel.Trace;
    writer.write("Hello, World!").writeLine();
    writer.debug("Hello, World!");
    writer.info("Hello, World!");
    writer.trace("Hello, World!");
    writer.warn("Hello, World!");
    writer.error("Hello, World!");
    writer.success("Hello, World!");
    writer.startGroup("Hello, World!");
    writer.command("dotnet", ["build", "--configuration", "Custom Release", "--no-restore"]);
    writer.writeLine(apply("Hello, World!", bold, green, bgBlue) + " test");
});
