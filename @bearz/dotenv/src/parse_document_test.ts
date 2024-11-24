import { equal } from "@bearz/assert";
import { parseDocument } from "./parse_document.ts";

const test = Deno.test;

test("dotnev::parseDocument", () => {
    const source = `# comment

FOO=bar`;

    const document = parseDocument(source);
    equal(document.length, 3);
    const [comment, empty, variable] = document.toArray();
    equal(comment.kind, "comment");
    equal(empty.kind, "newline");
    equal(variable.kind, "item");
    equal(variable.key, "FOO");
    equal(variable.value, "bar");
});

test("dotenv::parseDocument - multiline using escape character", () => {
    const source = `FOO="bar\\nbaz"`;
    const document = parseDocument(source);
    const set = document.toArray();
    console.log(set);
    equal(document.length, 1);

    const [variable] = document.toArray();
    equal(variable.kind, "item");
    equal(variable.key, "FOO");
    equal(variable.value, "bar\nbaz");
});

test("dotenv::parseDocument - multiline with new line", () => {
    const source = `FOO="bar
baz"`;
    const document = parseDocument(source);
    const set = document.toArray();
    console.log(set);
    equal(document.length, 1);

    const [variable] = document.toArray();
    equal(variable.kind, "item");
    equal(variable.key, "FOO");
    equal(variable.value, "bar\nbaz");
});

test("dotenv::parseDocument - spacing around key", () => {
    let source = ` FOO  ="bar"`;
    let document = parseDocument(source);

    equal(document.length, 1);

    const [variable] = document.toArray();
    equal(variable.kind, "item");
    equal(variable.key, "FOO");
    equal(variable.value, "bar");

    source = `FOO   ="bar"`;
    document = parseDocument(source);
    equal(document.length, 1);
    const [variable2] = document.toArray();
    equal(variable2.kind, "item");
    equal(variable2.key, "FOO");
    equal(variable2.value, "bar");

    source = `   FOO=bar`;
    document = parseDocument(source);
    equal(document.length, 1);
    const [variable3] = document.toArray();
    equal(variable3.kind, "item");
    equal(variable3.key, "FOO");
    equal(variable3.value, "bar");
});

test("dotenv::parseDocument - spacing around unquoted value", () => {
    let source = `FOO=  bar`;
    let document = parseDocument(source);
    equal(document.length, 1);
    const [variable] = document.toArray();
    equal(variable.kind, "item");
    equal(variable.key, "FOO");
    equal(variable.value, "bar");

    source = `FOO=bar  `;
    document = parseDocument(source);
    equal(document.length, 1);
    const [variable2] = document.toArray();
    equal(variable2.kind, "item");
    equal(variable2.key, "FOO");
    equal(variable2.value, "bar");

    source = `FOO=   bar  `;
    document = parseDocument(source);
    equal(document.length, 1);
    const [variable3] = document.toArray();
    equal(variable3.kind, "item");
    equal(variable3.key, "FOO");
    equal(variable3.value, "bar");

    source = `FOO=   bar  

  `;
    document = parseDocument(source);
    console.log(document.toArray());
    equal(document.length, 3);
    const [variable4] = document.toArray();
    equal(variable4.kind, "item");
    equal(variable4.key, "FOO");
    equal(variable4.value, "bar");
});

test("dotenv::parseDocument - spacing around quoted value", () => {
    let source = `FOO="  bar"`;
    let document = parseDocument(source);
    equal(document.length, 1);
    const [variable] = document.toArray();
    equal(variable.kind, "item");
    equal(variable.key, "FOO");
    equal(variable.value, "  bar");

    source = `FOO="bar  "`;
    document = parseDocument(source);
    equal(document.length, 1);
    const [variable2] = document.toArray();
    equal(variable2.kind, "item");
    equal(variable2.key, "FOO");
    equal(variable2.value, "bar  ");

    source = `FOO="   bar  "`;
    document = parseDocument(source);
    equal(document.length, 1);
    const [variable3] = document.toArray();
    equal(variable3.kind, "item");
    equal(variable3.key, "FOO");
    equal(variable3.value, "   bar  ");

    source = `FOO="   bar  "

  `;
    document = parseDocument(source);
    console.log(document.toArray());
    equal(document.length, 3);
    const [variable4] = document.toArray();
    equal(variable4.kind, "item");
    equal(variable4.key, "FOO");
    equal(variable4.value, "   bar  ");
});

test("dotenv::parseDocument - allow lowercase keys", () => {
    const source = `foo=bar
BAR=baz
MiXeD=case`;
    const document = parseDocument(source);
    const set = document.toObject();
    equal(document.length, 3);
    equal(set.foo, "bar");
    equal(set.BAR, "baz");
    equal(set.MiXeD, "case");
});

test("dotenv::parseDocument - complex", () => {
    const source = `# comment
FOO1=\`echo bar\`
FOO2="bar"

# comment=2
    # comment=3 
FOO3=bar
FOO4="new
line"
FOO5="new\\nline"
FOO6='new
line'`;

    const document = parseDocument(source);
    const nl = "new\nline";
    const vars = document.toObject();
    equal(document.length, 10);
    equal(vars.FOO1, "echo bar");
    equal(vars.FOO2, "bar");
    equal(vars.FOO3, "bar");
    equal(vars.FOO4, nl);
    equal(vars.FOO5, "new\nline");
    equal(vars.FOO6, nl);
});
