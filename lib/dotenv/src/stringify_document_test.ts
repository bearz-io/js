import { equal } from "@bearz/assert";
import { DotEnvDocument } from "./document.ts";
import { stringifyDocument } from "./stringify_document.ts";

const test = Deno.test;

test("dotenv::stringifyDocument", () => {
    const doc = new DotEnvDocument();
    doc.comment("comment=1");
    doc.newline();
    doc.item("FOO", "bar");
    doc.item("BAR", "baz\n");
    doc.newline();
    console.log(doc.toArray());

    const source = stringifyDocument(doc);
    console.log(source, "end");

    equal(
        source,
        `#comment=1

FOO='bar'
BAR="baz
"
`,
    );
});
