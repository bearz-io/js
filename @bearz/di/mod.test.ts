import { equal, ok as assert, nope,  instanceOf } from "@bearz/assert";
import { ServicesContainer, type ServiceFactory, type ProviderFactoryConfig, createProvider, createDynamicProvider, registerProviderFactory, type ProviderFactory } from "./mod.ts";
import { NotFoundError } from "@bearz/errors/not-found";

const { test } = Deno;

test("@bearz/di::ServicesContainer - register and get singleton service", () => {
    const container = new ServicesContainer();
    const key = "testService";
    const service = { name: "test" };

    container.registerSingletonValue(key, service);
    const result = container.get<typeof service>(key);

    equal(result, service);
});

test("@bearz/di::ServicesContainer - register and get transient service", () => {
    const container = new ServicesContainer();
    const key = "testService";
    const serviceFactory: ServiceFactory = () => ({ name: "test" });

    container.registerTransient(key, serviceFactory);
    const result1 = container.get<{ name: string }>(key);
    const result2 = container.get<{ name: string }>(key);

    equal(result1?.name, "test");
    equal(result2?.name, "test");
    nope(Object.is(result1, result2));
});

test("@bearz/di::ServicesContainer - register and get scoped service", () => {
    const container = new ServicesContainer();
    const key = "testService";
    const serviceFactory: ServiceFactory = () => ({ name: "test" });

    container.registerScoped(key, serviceFactory);
    const scope1 = container.createScope();
    const scope2 = container.createScope();

    const result1 = scope1.get<{ name: string }>(key);
    const result2 = scope2.get<{ name: string }>(key);

    equal(result1?.name, "test");
    equal(result2?.name, "test");
    equal(result1 !== result2, true);
});

test("@bearz/di::ServicesContainer - require service", () => {
    const container = new ServicesContainer();
    const key = "testService";
    const service = { name: "test" };

    container.registerSingletonValue(key, service);
    const result = container.require<typeof service>(key);

    equal(result.isOk, true);
    equal(result.unwrap(), service);
});

test("@bearz/di::ServicesContainer - require non-existent service", () => {
    const container = new ServicesContainer();
    const key = "nonExistentService";

    const result = container.require(key);

    equal(result.isError, true);
    equal(result.unwrapError() instanceof NotFoundError, true);
});

test("@bearz/di::ProviderFactories - create provider", () => {
    const key = "testProvider";
    const factory: ProviderFactory = {
        match: (params: ProviderFactoryConfig) => params.use === key,
        create: (params: ProviderFactoryConfig) => ({ name: params.name })
    };

    registerProviderFactory(key, factory);

    const params: ProviderFactoryConfig = { name: "test", use: key, kind: "test" };
    const result = createProvider<typeof factory.create>(params);

    equal(result.isOk, true);
    equal(result.unwrap().name, "test");
});

test("@bearz/di::ProviderFactories - create non-existent provider", () => {
    const params: ProviderFactoryConfig = { name: "test", use: "nonExistentProvider", kind: "test" };
    const result = createProvider(params);

    equal(result.isError, true);
    equal(result.unwrapError() instanceof NotFoundError, true);
});

test("@bearz/di::ProviderFactories - create dynamic provider", async () => {
    const key = "dynamicProvider";
    const factory: ProviderFactory = {
        match: (params: ProviderFactoryConfig) => params.use === key,
        create: (params: ProviderFactoryConfig) => ({ name: params.name })
    };

    registerProviderFactory(key, factory);

    const params: ProviderFactoryConfig = { name: "test", use: key, kind: "test" };
    const result = await createDynamicProvider<typeof factory.create>(params);

    assert(result.isOk);
    equal(result.unwrap().name, "test");
});

test("@bearz/di::ProviderFactories - create non-existent dynamic provider", async () => {
    const params: ProviderFactoryConfig = { name: "test", use: "nonExistentProvider", kind: "test" };
    const result = await createDynamicProvider(params);

    assert(result.isError);
    console.log(result.unwrapError().name);
    const error = result.unwrapError();
    instanceOf(error, Error);
    equal(error.name, "Error");
    equal(error.message, "Invalid import directive for test://nonExistentProvider: nonExistentProvider");
});

test("@bearz/di::ServicesContainer - register and get multiple singleton services", () => {
    const container = new ServicesContainer();
    const key1 = "testService1";
    const key2 = "testService2";
    const service1 = { name: "test1" };
    const service2 = { name: "test2" };

    container.registerSingletonValue(key1, service1);
    container.registerSingletonValue(key2, service2);

    const result1 = container.get<typeof service1>(key1);
    const result2 = container.get<typeof service2>(key2);

    equal(result1, service1);
    equal(result2, service2);
});
