import { ok } from "@bearz/assert";
import { isUpper, isUpperAt } from "./is_upper.ts";

Deno.test("chars::isUpper", () => {
    ok(!isUpper(97)); // a
    ok(!isUpper(98)); // b
    ok(!isUpper(99)); // c
    ok(!isUpper(122)); // z

    ok(isUpper(65)); // A
    ok(isUpper(90)); // Z
    ok(!isUpper(48)); // 0
    ok(!isUpper(57)); // 9

    ok(isUpper(0xA64E)); // Ꙏ
    ok(!isUpper(0xA64F)); // ꙏ
});

Deno.test("chars::isUpperAt", () => {
    const str = "Holy 💩Ꙏ";
    ok(isUpperAt(str, 0));
    ok(!isUpperAt(str, 1));
    ok(!isUpperAt(str, 2));
    ok(!isUpperAt(str, 3));
    ok(!isUpperAt(str, 4));
    ok(!isUpperAt(str, 5));
    ok(!isUpperAt(str, 6));
    ok(isUpperAt(str, 7));
});
