import { ok } from "@bearz/assert";
import { equalFold, simpleFold } from "./simple_fold.ts";

Deno.test("chars::simpleFold", () => {
    ok(simpleFold(0x0041) === 0x0061);
    ok(simpleFold(0x0061) === 0x0041);
    ok(simpleFold(0x00B5) === 0x039C);
    ok(simpleFold(0x039C) === 0x03BC);
    ok(simpleFold(0x03BC) === 0x00B5);
    ok(simpleFold(0x1F600) === 0x1F600);
    ok(simpleFold(0x1F600) === 0x1F600);
    ok(simpleFold(0x1F600) === 0x1F600);
    ok(simpleFold(0x1F600) === 0x1F600);
    ok(simpleFold(0x1F600) === 0x1F600);
    ok(simpleFold(0x1F600) === 0x1F600);
    ok(simpleFold(0x1F600) === 0x1F600);
    ok(simpleFold(0x1F600) === 0x1F600);
    ok(simpleFold(0x1F600) === 0x1F600);
    ok(simpleFold(0x1F600) === 0x1F600);
    ok(simpleFold(0x1F600) === 0x1F600);
});

Deno.test("chars::equalFold", () => {
    ok(equalFold(0x0041, 0x0061));
    ok(equalFold(0x0061, 0x0041));
    ok(equalFold(0x00B5, 0x039C));
    ok(equalFold(0x039C, 0x03BC));
    ok(equalFold(0x03BC, 0x00B5));
});
