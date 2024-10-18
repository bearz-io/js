import { ok } from "@bearz/assert";
import { toLower } from "./to_lower.ts";

Deno.test("chars::toLower", () => {
    ok(toLower(0x0041) === 0x0061);
    ok(toLower(0x0061) === 0x0061);
    ok(toLower(0x00B5) === 0x00B5);
    ok(toLower(0x039C) === 0x03BC);
    ok(toLower(0x03BC) === 0x03BC);
    ok(toLower(0x1F600) === 0x1F600);
    ok(toLower(0x1F600) === 0x1F600);
    ok(toLower(0x1F600) === 0x1F600);
    ok(toLower(0x1F600) === 0x1F600);
    ok(toLower(0x1F600) === 0x1F600);
    ok(toLower(0x1F600) === 0x1F600);
    ok(toLower(0x1F600) === 0x1F600);
    ok(toLower(0x1F600) === 0x1F600);
    ok(toLower(0x1F600) === 0x1F600);
    ok(toLower(0x1F600) === 0x1F600);
    ok(toLower(0x1F600) === 0x1F600);
});
