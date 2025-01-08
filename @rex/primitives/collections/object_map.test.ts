import { ObjectMap } from "./object_map.ts";
import { none, some } from "@bearz/functional";
import { equal } from "@bearz/assert";

const { test } = Deno;

test("@rex/primitives::ObjectMap - array should return some when value is an array", () => {
    const map = new ObjectMap();
    map.set("key", [1, 2, 3]);
    equal(map.array("key"), some([1, 2, 3]));
});

test("@rex/primitives::ObjectMap - array should return none when value is not an array", () => {
    const map = new ObjectMap();
    map.set("key", "not an array");
    equal(map.array("key"), none());
});

test("@rex/primitives::ObjectMap - object should return some when value is an object", () => {
    const map = new ObjectMap();
    const obj = { a: 1 };
    map.set("key", obj);
    equal(map.object("key"), some(obj));
});

test("@rex/primitives::ObjectMap - object should return none when value is not an object", () => {
    const map = new ObjectMap();
    map.set("key", "not an object");
    equal(map.object("key"), none());
});

test("@rex/primitives::ObjectMap - map should return some when value is an ObjectMap", () => {
    const map = new ObjectMap();
    const objMap = new ObjectMap();
    map.set("key", objMap);
    equal(map.map("key"), some(objMap));
});

test("@rex/primitives::ObjectMap - map should return none when value is not an ObjectMap", () => {
    const map = new ObjectMap();
    map.set("key", "not an ObjectMap");
    equal(map.map("key"), none());
});

test("@rex/primitives::ObjectMap - string should return some when value is a string", () => {
    const map = new ObjectMap();
    map.set("key", "value");
    equal(map.string("key"), some("value"));
});

test("@rex/primitives::ObjectMap - string should return none when value is not a string", () => {
    const map = new ObjectMap();
    map.set("key", 123);
    equal(map.string("key"), none());
});

test("@rex/primitives::ObjectMap - boolean should return some when value is a boolean", () => {
    const map = new ObjectMap();
    map.set("key", true);
    equal(map.boolean("key"), some(true));
});

test("@rex/primitives::ObjectMap - boolean should return some when value is a string 'true'", () => {
    const map = new ObjectMap();
    map.set("key", "true");
    equal(map.boolean("key"), some(true));
});

test("@rex/primitives::ObjectMap - boolean should return some when value is a number 1", () => {
    const map = new ObjectMap();
    map.set("key", 1);
    equal(map.boolean("key"), some(true));
});

test("@rex/primitives::ObjectMap - boolean should return none when value is not a boolean", () => {
    const map = new ObjectMap();
    map.set("key", "not a boolean");
    equal(map.boolean("key"), none());
});

test("@rex/primitives::ObjectMap - int should return some when value is an integer", () => {
    const map = new ObjectMap();
    map.set("key", 123);
    equal(map.int("key"), some(123));
});

test("@rex/primitives::ObjectMap - int should return none when value is not an integer", () => {
    const map = new ObjectMap();
    map.set("key", 123.45);
    equal(map.int("key"), none());
});

test("@rex/primitives::ObjectMap - bigint should return some when value is a bigint", () => {
    const map = new ObjectMap();
    map.set("key", BigInt(123));
    equal(map.bigint("key"), some(BigInt(123)));
});

test("@rex/primitives::ObjectMap - bigint should return none when value is not a bigint", () => {
    const map = new ObjectMap();
    map.set("key", "not a bigint");
    equal(map.bigint("key"), none());
});

test("@rex/primitives::ObjectMap - number should return some when value is a number", () => {
    const map = new ObjectMap();
    map.set("key", 123.45);
    equal(map.number("key"), some(123.45));
});

test("@rex/primitives::ObjectMap - number should return none when value is not a number", () => {
    const map = new ObjectMap();
    map.set("key", "not a number");
    equal(map.number("key"), none());
});
