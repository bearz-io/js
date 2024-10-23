import { ok } from "@bearz/assert";
import { isPunc, isPuncAt } from "./is_punc.ts";

Deno.test("chars::isPunc", () => {
    ok(isPunc(33)); // !
    ok(isPunc(34)); // "
    ok(isPunc(35)); // #
    ok(!isPunc(36)); // $
    ok(isPunc(37)); // %
    ok(isPunc(38)); // &
    ok(isPunc(39)); // '
    ok(isPunc(40)); // (
    ok(isPunc(41)); // )
    ok(isPunc(42)); // *
    ok(!isPunc(43)); // +
    ok(isPunc(44)); // ,
    ok(isPunc(45)); // -
    ok(isPunc(46)); // .
    ok(isPunc(47)); // /
    ok(isPunc(58)); // :
    ok(isPunc(59)); // ;
    ok(!isPunc(60)); // <
    ok(!isPunc(61)); // =
    ok(!isPunc(62)); // >
    ok(isPunc(63)); // ?
    ok(isPunc(64)); // @
    ok(isPunc(91)); // [
    ok(isPunc(92)); // \
    ok(isPunc(93)); // ]
    ok(!isPunc(94)); // ^
    ok(isPunc(95)); // _
    ok(!isPunc(96)); // `
    ok(isPunc(123)); // {
    ok(!isPunc(124)); // |
    ok(isPunc(125)); // }
    ok(!isPunc(126)); // ~
    ok(!isPunc(0));
    ok(!isPunc(127));
    ok(!isPunc(128));
    ok(!isPunc(255));
    ok(!isPunc(256));
    ok(!isPunc(-1));
    ok(!isPunc(-128));
    ok(!isPunc(-255));
    ok(!isPunc(-256));
    ok(!isPunc(Infinity));
    ok(!isPunc(-Infinity));
    ok(!isPunc(NaN));
    ok(!isPunc(0.1));
    ok(!isPunc(-0.1));
    ok(!isPunc(0.9));
    ok(!isPunc(-0.9));
    ok(!isPunc(1.1));
    ok(!isPunc(-1.1));
});

Deno.test("chars::isPuncAt", () => {
    const str = "Holy 💩!?";
    ok(!isPuncAt(str, 0));
    ok(!isPuncAt(str, 1));
    ok(!isPuncAt(str, 2));
    ok(!isPuncAt(str, 3));
    ok(!isPuncAt(str, 4));
    ok(!isPuncAt(str, 5));
    ok(!isPuncAt(str, 6));
    ok(isPuncAt(str, 7));
    ok(isPuncAt(str, 8));
});
