import { from, none, OptionError, some } from "./option.ts";
import { assert as ok, assertEquals as equals, assertThrows as throws } from "@std/assert";

Deno.test("Option: some", () => {
    const option = some(42);
    ok(option.isSome);
    ok(option.unwrap() === 42);
});

Deno.test("Option: none", () => {
    const option = none();
    ok(option.isNone);
    ok(() => option.unwrap(), "Option is None");
});

Deno.test("Option: and", () => {
    const option = some(42);
    const other = some(43);
    ok(option.and(other).unwrap() === 43);
});

Deno.test("Option: andThen", () => {
    const option = some(42);
    const other = some(43);
    ok(option.andThen(() => other).unwrap() === 43);
});

Deno.test("Option: or", () => {
    const option = some(42);
    const other = some(43);
    ok(option.or(other).unwrap() === 42);
});

Deno.test("Option: orElse", () => {
    const option = some(42);
    const other = some(43);
    ok(option.orElse(() => other).unwrap() === 42);
});

Deno.test("Option: expect", () => {
    const option = some(42);
    equals(option.expect("Option is None"), 42);

    const other = none<number>();
    throws(() => other.expect("Option is None"), OptionError, "Option is None");
});

Deno.test("Option: map", () => {
    const option = some(42);
    const other = option.map((value) => value + 1);
    ok(other.unwrap() === 43);
});

Deno.test("Option: inspect", () => {
    let value = 0;
    const option = some(42);
    option.inspect((v) => value = v);
    ok(value === 42);

    value = 0;
    const other = none<number>();
    other.inspect((v) => value = v);
    ok(value === 0);
});

Deno.test("Option: unwrap", () => {
    const option = some(42);
    equals(option.unwrap(), 42);

    const other = none<number>();
    throws(() => other.unwrap(), OptionError, "Option is None");
});

Deno.test("Option: unwrapOr", () => {
    const option = some(42);
    equals(option.unwrapOr(0), 42);

    const other = none<number>();
    equals(other.unwrapOr(0), 0);
});

Deno.test("Option: unwrapOrElse", () => {
    const option = some(42);
    equals(option.unwrapOrElse(() => 0), 42);

    const other = none<number>();
    equals(other.unwrapOrElse(() => 0), 0);
});

Deno.test("Option: zip", () => {
    const option = some(42);
    const other = some(43);
    const zipped = option.zip(other);
    ok(zipped.isSome);
    equals(zipped.unwrap(), [42, 43]);

    const noneOption = none<number>();
    const noneOther = some(43);
    const noneZipped = noneOption.zip(noneOther);
    ok(noneZipped.isNone);
});

Deno.test("Option: from", () => {
    const option = from(42);
    const other = from<number>(null);
    equals(option.unwrap(), 42);
    throws(() => other.unwrap(), OptionError, "Option is None");
});
