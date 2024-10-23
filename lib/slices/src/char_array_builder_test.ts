import { equal } from "@bearz/assert";
import { CharArrayBuilder } from "./char_array_builder.ts";
import { CharSlice } from "./char_slice.ts";

const test = Deno.test;

test("slices::CharArrayBuilder.appendChar", () => {
    const sb = new CharArrayBuilder();
    sb.appendChar(0x61);
    sb.appendChar(0x62);
    sb.appendChar(0x63);
    sb.appendChar(0x64);
    sb.appendChar(0x65);
    sb.appendChar(0x66);
    sb.appendChar(0x67);
    sb.appendChar(0x68);
    sb.appendChar(0x69);
    sb.appendChar(0x6A);
    sb.appendChar(0x6B);
    sb.appendChar(0x6C);
    sb.appendChar(0x6D);
    sb.appendChar(0x6E);
    sb.appendChar(0x6F);
    sb.appendChar(0x70);
    sb.appendChar(0x71);
    sb.appendChar(0x72);
    sb.appendChar(0x73);
    sb.appendChar(0x74);
    sb.appendChar(0x75);
    sb.appendChar(0x76);
    sb.appendChar(0x77);
    sb.appendChar(0x78);
    sb.appendChar(0x79);
    sb.appendChar(0x7A);
    const actual = sb.toString();
    equal(actual, "abcdefghijklmnopqrstuvwxyz");
    equal(sb.length, 26);
});

test("slices::CharArrayBuilder.append", () => {
    const sb = new CharArrayBuilder();
    sb.append("abcdefghijklmnopqrstuvwxyz");
    const actual = sb.toString();
    equal(actual, "abcdefghijklmnopqrstuvwxyz");
});

test("slices::CharArrayBuilder.appendSlice", () => {
    const sb = new CharArrayBuilder();
    sb.appendSlice(CharSlice.fromString("abcdefghijklmnopqrstuvwxyz"));
    const actual = sb.toString();
    equal(actual, "abcdefghijklmnopqrstuvwxyz");
});

test("slices::CharArrayBuilder.appendFormat", () => {
    const sb = new CharArrayBuilder();
    sb.appendFormat("%s", "abcdefghijklmnopqrstuvwxyz");
    const actual = sb.toString();
    equal(actual, "abcdefghijklmnopqrstuvwxyz");
});

test("slices::CharArrayBuilder.appendCharArray", () => {
    const sb = new CharArrayBuilder();
    sb.appendCharArray(
        new Uint32Array([
            0x61,
            0x62,
            0x63,
            0x64,
            0x65,
            0x66,
            0x67,
            0x68,
            0x69,
            0x6A,
            0x6B,
            0x6C,
            0x6D,
            0x6E,
            0x6F,
            0x70,
            0x71,
            0x72,
            0x73,
            0x74,
            0x75,
            0x76,
            0x77,
            0x78,
            0x79,
            0x7A,
        ]),
    );
    const actual = sb.toString();
    equal(actual, "abcdefghijklmnopqrstuvwxyz");
});

test("slices::CharArrayBuilder.appendString", () => {
    const sb = new CharArrayBuilder();
    sb.appendString("abcdefghijklmnopqrstuvwxyz");
    const actual = sb.toString();
    equal(actual, "abcdefghijklmnopqrstuvwxyz");
});

test("slices::CharArrayBuilder.clear", () => {
    const sb = new CharArrayBuilder();
    sb.appendString("abcdefghijklmnopqrstuvwxyz");
    sb.clear();
    equal(sb.length, 0);
    equal(sb.toString(), "");
});
