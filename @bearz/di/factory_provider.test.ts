import { equal, nope, ok } from "@bearz/assert";
import {
    createDynamicProvider,
    createProvider,
    ProviderFactories,
    type ProviderFactory,
    type ProviderFactoryConfig,
    registerProviderFactory,
    removeProviderFactory,
    toProviderFactoryConfig,
} from "./factory_provider.ts";

const { test } = Deno;

test("di::toProviderFactoryConfig - converts string URL to config", () => {
    const config = toProviderFactoryConfig("test://example.com?name=test&param=value");
    equal(config.kind, "test");
    equal(config.use, "example.com");
    equal(config.name, "test");
    equal(config.with?.param, "value");
});

test("di::toProviderFactoryConfig - converts URL object to config", () => {
    const url = new URL("test://example.com?name=test&param=value");
    const config = toProviderFactoryConfig(url);
    equal(config.kind, "test");
    equal(config.use, "example.com");
    equal(config.name, "test");
    equal(config.with?.param, "value");
});

test("di::ProviderFactories - match returns true when factory exists", () => {
    const factories = new ProviderFactories();
    const testFactory: ProviderFactory = {
        match: (params: ProviderFactoryConfig) => params.kind === "test",
        create: () => ({}),
    };

    factories.set("test://example", testFactory);

    ok(factories.match({
        kind: "test",
        name: "test",
        use: "example",
    }));
});

test("di::ProviderFactories - match returns false when no factory exists", () => {
    const factories = new ProviderFactories();

    nope(factories.match({
        kind: "missing",
        name: "test",
        use: "example",
    }));
});

test("di::ProviderFactories - matchKey returns key when factory exists", () => {
    const factories = new ProviderFactories();
    const testFactory: ProviderFactory = {
        match: (params: ProviderFactoryConfig) => params.kind === "test",
        create: () => ({}),
    };

    const key = "test://example";
    factories.set(key, testFactory);

    equal(
        factories.matchKey({
            kind: "test",
            name: "test",
            use: "example",
        }),
        key,
    );
});

test("di::createProvider - returns instance when factory exists", () => {
    const testInstance = { test: true };
    const testFactory: ProviderFactory = {
        match: () => true,
        create: () => testInstance,
    };

    registerProviderFactory("test://example", testFactory);

    const result = createProvider({
        kind: "test",
        name: "test",
        use: "example",
    });

    ok(result.isOk);
    equal(result.unwrap(), testInstance);
});

test("di::createProvider - returns error when factory not found", () => {
    removeProviderFactory("test://example");
    const result = createProvider({
        kind: "missing1",
        name: "test1",
        use: "example11",
    });

    ok(result.isError);
});

test("di::createDynamicProvider - returns error when factory not found and import fails", async () => {
    removeProviderFactory("test://example");

    const result = await createDynamicProvider({
        kind: "missing2",
        name: "test10",
        use: "example10",
    });

    ok(result.isError);
});
