import { equal, ok } from "@bearz/assert";
import { StringMap } from "./string_map.ts";
import { none, some } from "@bearz/functional";

const { test } = Deno;

test("@rex/primitives::StringMap - fromObject", () => {
    const obj = { key1: "value1", key2: "value2" };
    const map = StringMap.fromObject(obj);
    ok(map.get("key1") === "value1");
    ok(map.get("key2") === "value2");
});

test("@rex/primitives::StringMap - toObject", () => {
    const map = new StringMap();
    map.set("key1", "value1");
    map.set("key2", "value2");
    const obj = map.toObject();
    equal(obj, { key1: "value1", key2: "value2" });
});

test("@rex/primitives::StringMap - boolean", () => {
    const map = new StringMap();
    map.set("key1", "true");
    map.set("key2", "1");
    equal(map.boolean("key1"), some(true));
    equal(map.boolean("key2"), some(true));

    map.set("key1", "false");
    map.set("key2", "0");
    equal(map.boolean("key1"), some(false));
    equal(map.boolean("key2"), some(false));

    equal(map.boolean("key1"), none());
});

test("@rex/primitives::StringMap - int", () => {
    const map = new StringMap();
    map.set("key1", "123");
    equal(map.int("key1"), some(123));

    map.set("key1", "abc");
    equal(map.int("key1"), none());
});

test("@rex/primitives::StringMap - number", () => {
    const map = new StringMap();
    map.set("key1", "123.45");
    equal(map.number("key1"), some(123.45));

    map.set("key1", "abc");
    equal(map.number("key1"), none());
});
