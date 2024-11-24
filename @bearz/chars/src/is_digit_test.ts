import { ok } from "@bearz/assert";
import { isDigit, isDigitAt } from "./is_digit.ts";

Deno.test("chars::isDigit", () => {
    ok(isDigit(48)); // 0
    ok(isDigit(49)); // 1
    ok(isDigit(50)); // 2
    ok(isDigit(51)); // 3

    ok(!isDigit(1)); // \x01
    ok(isDigit(0x0e50)); // ๐
    ok(isDigit(0x0e51)); // ๑
    ok(isDigit(0x0e52)); // ๒
});

Deno.test("chars::isDigitAt", () => {
    const str = "Hello 123!";
    ok(!isDigitAt(str, 0));
    ok(!isDigitAt(str, 1));
    ok(isDigitAt(str, 6));

    const str2 = "๐ ๑ ๒ ๓ ๔ ๕ ๖ ๗ ๘ ๙";
    ok(isDigitAt(str2, 0));
    ok(!isDigitAt(str2, 1));
    ok(isDigitAt(str2, 2));
    ok(isDigitAt(str2, 4));
});
