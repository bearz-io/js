import { equal, nope, ok } from "@bearz/assert";
import { ServicesContainer } from "./core.ts";
import { NotFoundError } from "@bearz/errors/not-found";

const { test } = Deno;

test("di::ServicesContainer - registers and resolves singleton service", () => {
    const container = new ServicesContainer();
    container.registerSingleton("test", () => "hello");
    const result = container.get<string>("test");
    equal(result, "hello");

    // Should return same instance
    const result2 = container.get<string>("test");
    equal(result, result2);
});

test("di::ServicesContainer - registers and resolves transient service", () => {
    const container = new ServicesContainer();
    let count = 0;
    container.registerTransient("test", () => {
        count++;
        return count;
    });

    const result1 = container.get<number>("test");
    equal(result1, 1);

    // Should return new instance
    const result2 = container.get<number>("test");
    equal(result2, 2);
});

test("di::ServicesContainer - registers and resolves scoped service", () => {
    const container = new ServicesContainer();
    let count = 0;
    container.registerScoped("test", () => {
        count++;
        return count;
    });

    const scope1 = container.createScope();
    const scope2 = container.createScope();

    const result1 = scope1.get<number>("test");
    equal(result1, 1);

    // Same scope should return same instance
    const result2 = scope1.get<number>("test");
    equal(result2, 1);

    // Different scope should return new instance
    const result3 = scope2.get<number>("test");
    equal(result3, 2);
});

test("di::ServicesContainer - require returns Result", () => {
    const container = new ServicesContainer();
    container.registerSingleton("test", () => "hello");

    const result = container.require<string>("test");
    ok(result.isOk);
    equal(result.unwrap(), "hello");

    const notFound = container.require<string>("missing");
    ok(notFound.isError);
    ok(notFound.unwrapError() instanceof NotFoundError);
});

test("di::ServicesContainer - tryRegister only registers if key not exists", () => {
    const container = new ServicesContainer();

    const success = container.tryRegisterSingleton("test", () => "first");
    ok(success);
    equal(container.get("test"), "first");

    const failed = container.tryRegisterSingleton("test", () => "second");
    nope(failed);
    equal(container.get("test"), "first");
});

test("di::ServicesContainer - enumerate returns all registered services", () => {
    const container = new ServicesContainer();
    container.registerSingleton("test", () => "hello");
    container.registerSingleton("test", () => "world");

    const results = container.enumerate<string>("test");
    equal(results.length, 2);
    equal(results[0], "hello");
    equal(results[1], "world");
});

test("di::ServicesContainer - disposes services correctly", () => {
    const container = new ServicesContainer();
    let disposed = false;

    const disposable = {
        value: "test",
        [Symbol.dispose]() {
            disposed = true;
        },
    };

    container.registerSingleton("test", () => disposable);
    container.get("test"); // Create instance

    container[Symbol.dispose]();
    ok(disposed);
});
