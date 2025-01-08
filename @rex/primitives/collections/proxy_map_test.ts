import { ProxyMap } from "./proxy_map.ts";
import { none, some } from "@bearz/functional";
import { equal, ok } from "@bearz/assert";

const { test } = Deno;

test("@rex/primitives::ProxyMap should be empty initially", () => {
    const map = new ProxyMap<number>();
    ok(map.empty());
});

test("@rex/primitives::ProxyMap should set and get values", () => {
    const map = new ProxyMap<number>();
    map.set("key1", 1);
    equal(map.get("key1"), 1);
    equal(map.size, 1);
});

test("@rex/primitives::ProxyMap should check if key exists", () => {
    const map = new ProxyMap<number>();
    map.set("key1", 1);
    ok(map.exists("key1"));
    ok(!map.exists("key2"));
});

test("@rex/primitives::ProxyMap should merge with another object", () => {
    const map = new ProxyMap<number>();
    map.set("key1", 1);
    map.merge({ key2: 2 });
    equal(map.get("key1"), 1);
    equal(map.get("key2"), 2);
});

test("@rex/primitives::ProxyMap should merge with another ProxyMap", () => {
    const map = new ProxyMap<number>();
    const otherMap = new ProxyMap<number>();
    otherMap.set("key2", 2);
    map.set("key1", 1);
    map.merge(otherMap);
    equal(map.get("key1"), 1);
    equal(map.get("key2"), 2);
});

test("@rex/primitives::ProxyMap should try to get a value", () => {
    const map = new ProxyMap<number>();
    map.set("key1", 1);
    equal(map.tryGet("key1"), some(1));
    equal(map.tryGet("key2"), none());
});

test("@rex/primitives::ProxyMap should query nested values", () => {
    const map = new ProxyMap<number>();
    const nestedMap = new ProxyMap<number>();
    nestedMap.set("nestedKey", 2);
    map.set("key1", nestedMap as unknown as number);
    equal(map.query("key1.nestedKey"), some(2));
    equal(map.query("key1.nonExistentKey"), none());
});

test("@rex/primitives::ProxyMap should convert to plain object", () => {
    const map = new ProxyMap<number>();
    map.set("key1", 1);
    map.set("key2", 2);
    equal(map.toObject(), { key1: 1, key2: 2 });
});

test("@rex/primitives::ProxyMap should interact with proxy", () => {
    const map = new ProxyMap<number>();
    map.set("key1", 1);
    const proxy = map.proxy;
    equal(proxy.key1, 1);
    proxy.key2 = 2;
    equal(map.get("key2"), 2);
    delete proxy.key1;
    ok(!map.has("key1"));
});
