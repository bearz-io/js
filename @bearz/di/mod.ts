import { coerceError, fail, ok, type Result } from "@bearz/functional";
import { NotFoundError } from "@bearz/errors/not-found";
import { toError } from "@bearz/errors/utils";

/**
 * The service provider interface.
 */
export interface ServiceProvider {
    /**
     * Enumerates all services of a given key.
     * @param key The key to get the service.
     */
    enumerate<T>(key: string): T[];

    /**
     * Creates a service of a given key. If multiple services are registered,
     * the first one will be returned.
     * @param key The key to get the service.
     * @returns The service or undefined if the service is not registered.
     */
    get<T>(key: string): T | undefined;

    /**
     * Creates a required service. The function returns a `Result<T>` that is either a Ok result or an Err result.
     *
     * @description
     * If the service is not registered, the function returns a NotFoundError. If an error occurs while creating the service,
     * the function returns the error. If there are no errors, the function returns an Ok result with the service which
     * can be obtained by calling `unwrap()` on the result.
     *
     * This design forces the caller to handle the error and makes it easier to test the code and force
     * the caller to make a decision on how to handle the error.
     *
     * @param key The key to get the service.
     * @returns A result that is Ok if the service is registered, otherwise an error.
     */
    require<T>(key: string): Result<T>;
}

/**
 * The service factory type that creates a service.
 */
export type ServiceFactory = (s: ServiceProvider) => unknown;

/**
 * The lifecycle of a service.
 * * singleton: A single instance is created and shared across the application.
 * * transient: A new instance is created every time the service is requested.
 * * scoped: A new instance is created for each scope.
 */
export type Lifecycle = "singleton" | "transient" | "scoped";

/**
 * The descriptor for a service.
 */
export interface Descriptor {
    /**
     * The key of the service.
     */
    key: string;
    /**
     * The factory function that creates the service.
     */
    factory: ServiceFactory;
    /**
     * The lifecycle of the service.
     */
    lifecycle: Lifecycle;
}

/**
 * The service container that manages the services.
 *
 * @description
 * A root container is created by default and can be accessed using the `getServices()` function.
 * A root container will dispose of all singleton instances and scoped instances when disposed. A
 * container with a parent will only dispose of the scoped instances.
 *
 * Dispose will call the [Symbol.dispose] method on instances/services that implement dispose.
 */
export class ServicesContainer implements ServiceProvider {
    #resolvers: Map<string, Descriptor[]> = new Map();
    #singletonCache: Map<string, unknown> = new Map();
    #scopedCache: Map<string, unknown> = new Map();
    #root: boolean;

    /**
     * Creates a new ServicesContainer.
     * @param parent The parent services container to inherit from.
     */
    constructor(parent?: ServicesContainer) {
        this.#root = true;
        if (parent) {
            // create a shallow clone of resolvers so that
            // it can be cleared and not reference the parent container.
            // and so that it can be modified without affecting the parent container.
            this.#resolvers = new Map(parent.#resolvers);
            this.#singletonCache = parent.#singletonCache;
            this.#scopedCache = new Map();
            this.#root = false;
        }
    }

    /**
     * Removes a registration for a given key.
     * @param key The key to remove the registration for.
     */
    removeRegistration(key: string) {
        this.#resolvers.delete(key);
    }

    /**
     * Registers a service descriptor.
     * @param descriptor The descriptor to register.
     */
    register(descriptor: Descriptor) {
        const desciptors = this.#resolvers.get(descriptor.key) ?? [];
        desciptors.push(descriptor);
        this.#resolvers.set(descriptor.key, desciptors);
    }

    /**
     * Sets a singleton value and makes it immediately available.
     * @param key The key to set.
     * @param value The singleton value to set.
     */
    set(key: string, value: unknown): void {
        this.#singletonCache.set(key, value);
    }

    /**
     * Asynchronously registers a service descriptor.
     * @param key The key to register.
     * @param lifecycle The lifecycle of the service.
     * @param fn The async function that returns a service factory.
     */
    async registerAsync(
        key: string,
        lifecycle: Lifecycle,
        fn: () => Promise<ServiceFactory> | ServiceFactory,
    ) {
        this.register({
            key,
            factory: await fn(),
            lifecycle,
        });
    }

    /**
     * Registers a singleton value.
     * @param key The key to set.
     * @param value The singleton value to set.
     */
    registerSingletonValue(key: string, value: unknown) {
        this.register({
            key,
            factory: () => value,
            lifecycle: "singleton",
        });
    }

    /**
     * Registers a singleton factory which will be used to
     * create a new instance of the service only once globally.
     * @param key The key to set.
     * @param factory The singleton factory to set.
     */
    registerSingleton(key: string, factory: ServiceFactory) {
        this.register({
            key,
            factory,
            lifecycle: "singleton",
        });
    }

    /**
     * Registers a transient factory which will be used to
     * create a new instance of the service every time it is requested.
     * @param key The key to set.
     * @param factory The transient factory to set.
     */
    registerTransient(key: string, factory: ServiceFactory) {
        this.register({
            key,
            factory,
            lifecycle: "transient",
        });
    }

    /**
     * Registers a scoped factory which will be used to
     * create a new instance of the service once for each scope.
     * @param key The key to set.
     * @param factory The scoped factory to set.
     */
    registerScoped(key: string, factory: ServiceFactory) {
        this.register({
            key,
            factory,
            lifecycle: "scoped",
        });
    }

    /**
     * Only registers a service descriptor if the key is not already registered.
     * @param descriptor The descriptor to register.
     */
    tryRegister(descriptor: Descriptor): boolean {
        if (!this.#resolvers.has(descriptor.key)) {
            this.register(descriptor);
            return true;
        }

        return false;
    }

    /**
     * Only registers a singleton factory if one is not already registered.
     * The singleton factory which will be used to create a new instance of the service
     * only once globally.
     * @param key The key to register.
     * @param factory The singleton factory to set.
     */
    tryRegisterSingleton(key: string, factory: ServiceFactory): boolean {
        return this.tryRegister({
            key,
            factory,
            lifecycle: "singleton",
        });
    }

    /**
     * Only registers a singleton value if one is not already registered.
     * The singleton value which will be used to create a new instance of the service
     * only once globally.
     * @param key The key to register.
     * @param value The singleton value to set.
     */
    tryRegisterSingletonValue(key: string, value: unknown): boolean {
        return this.tryRegister({
            key,
            factory: () => value,
            lifecycle: "singleton",
        });
    }

    /**
     * Only registers a transient factory if one is not already registered.
     * The transient factory which will be used to create a new instance of the service
     * every time it is requested.
     * @param key The key to register.
     * @param factory The transient factory to set.
     */
    tryRegisterTransient(key: string, factory: ServiceFactory): boolean {
        return this.tryRegister({
            key,
            factory,
            lifecycle: "transient",
        });
    }

    /**
     * Only registers a scoped factory if one is not already registered.
     * The scoped factory which will be used to create a new instance of the service
     * once for each scope.
     * @param key The key to register.
     * @param factory The transient factory to set.
     */
    tryRegisterScoped(key: string, factory: ServiceFactory): boolean {
        return this.tryRegister({
            key,
            factory,
            lifecycle: "scoped",
        });
    }

    /**
     * Enumerates all services of a given key.
     * @param key The key to get the service.
     * @returns An array of services for the given key.
     */
    enumerate<T = unknown>(key: string): T[] {
        const results: T[] = [];
        const descriptors = this.#resolvers.get(key) ?? [];
        for (const descriptor of descriptors) {
            switch (descriptor.lifecycle) {
                case "singleton":
                    results.push(this.resolveSingleton(descriptor) as T);
                    break;
                case "transient":
                    results.push(descriptor.factory(this) as T);
                    break;
                case "scoped":
                    results.push(this.resolveScoped(descriptor) as T);
                    break;
            }
        }

        return results;
    }

    /**
     * Resolves a service of a given key. If multiple services are registered,
     * the first one will be returned.
     *
     * @param key The key to get the service.
     * @returns A service of a given key.
     * @throws An error if there are issues during the creation of the service.
     */
    get<T = unknown>(key: string): T | undefined {
        const descriptors = this.#resolvers.get(key) ?? [];
        if (descriptors.length === 0) {
            return undefined;
        }

        const descriptor = descriptors[0];
        switch (descriptor.lifecycle) {
            case "singleton":
                return this.resolveSingleton(descriptor) as T;
            case "transient":
                return descriptor.factory(this) as T;
            case "scoped":
                return this.resolveScoped(descriptor) as T;
        }
    }

    /**
     * Asynchronously resolves a service of a given key. If multiple services are registered,
     * the first one will be returned.
     *
     * @param key The key to get the service.
     * @returns The service of a given key.
     */
    async getAsync<T = unknown>(key: string): Promise<T | undefined> {
        const value = this.get<T | Promise<T>>(key);

        if (value instanceof Promise) {
            return await value;
        }

        return value;
    }

    /**
     * Creates a required service. The function returns a `Result<T>` that is either a Ok result or an Err result.
     *
     * @description
     * If the service is not registered, the function returns a NotFoundError. If an error occurs while creating the service,
     * the function returns the error. If there are no errors, the function returns an Ok result with the service which
     * can be obtained by calling `unwrap()` on the result.
     *
     * This design forces the caller to make a decision on how to handle the error.
     *
     * @param key The key to get the service.
     * @returns A result that is Ok if the service is registered, otherwise an error.
     */
    require<T = unknown>(key: string): Result<T> {
        try {
            const result = this.get<T>(key);
            if (result === undefined) {
                return fail(new NotFoundError(key));
            }

            return ok(result);
        } catch (e) {
            return coerceError(e);
        }
    }

    /**
     * Creates a new scope for the container. A scope is a child container that inherits from the parent container
     * which will have all the singleton instances of the parent container, but will create new instances of scoped services.
     *
     * @returns A scoped services container that can be used to create scoped instances.
     */
    createScope(): ServicesContainer {
        return new ServicesContainer(this);
    }

    /**
     * Resolves a scoped instance which is local to the container. If the instance is not already created,
     * it will create it and cache it once per scope.
     * @param descriptor The descriptor to resolve.
     * @returns The scoped instance of the service.
     */
    private resolveScoped(descriptor: Descriptor): unknown {
        if (this.#scopedCache.has(descriptor.key)) {
            return this.#scopedCache.get(descriptor.key);
        }

        const instance = descriptor.factory(this);
        this.#scopedCache.set(descriptor.key, instance);
        return instance;
    }

    /**
     * Resolves a singleton instance which is global. If the instance is not already created,
     * it will create it and cache it once globally.
     * @param descriptor The descriptor to resolve.
     * @returns The singleton instance of the service.
     */
    private resolveSingleton(descriptor: Descriptor): unknown {
        if (this.#singletonCache.has(descriptor.key)) {
            return this.#singletonCache.get(descriptor.key);
        }

        const instance = descriptor.factory(this);
        this.#singletonCache.set(descriptor.key, instance);
        return instance;
    }

    /**
     * Disposes of the container.
     * @description
     * If the container is a root container, it will dispose of all singleton instances and scoped instances.
     * If instances are disposable, it will call the [Symbol.dispose] method on them.
     */
    [Symbol.dispose]() {
        const scoped = Array.from(this.#scopedCache.values());
        for (const instance of scoped) {
            const disposable = instance as { [Symbol.dispose]: () => void };
            if (typeof disposable[Symbol.dispose] === "function") {
                disposable[Symbol.dispose]();
                continue;
            }

            const asyncDisposable = instance as { [Symbol.asyncDispose]: () => Promise<void> };
            if (typeof asyncDisposable[Symbol.asyncDispose] === "function") {
                asyncDisposable[Symbol.asyncDispose]();
            }
        }

        if (this.#root) {
            for (const instance of this.#singletonCache.values()) {
                const disposable = instance as { [Symbol.dispose]: () => void };
                if (typeof disposable[Symbol.dispose] === "function") {
                    disposable[Symbol.dispose]();
                    continue;
                }

                const asyncDisposable = instance as { [Symbol.asyncDispose]: () => Promise<void> };
                if (typeof asyncDisposable[Symbol.asyncDispose] === "function") {
                    asyncDisposable[Symbol.asyncDispose]();
                }
            }

            this.#singletonCache.clear();
        }
        this.#scopedCache.clear();
        // deferefence the singleton cache for the case
        // where it references the parent container.
        this.#singletonCache = new Map();
        this.#resolvers.clear();
    }

    /**
     * Disposes of the container asynchernously.
     * @description
     * If the container is a root container, it will dispose of all singleton instances and scoped instances.
     * If instances are disposable, it will call the [Symbol.dispose] method on them.
     */
    async [Symbol.asyncDispose](): Promise<void> {
        const scoped = Array.from(this.#scopedCache.values());
        for (const instance of scoped) {
            const disposable = instance as { [Symbol.dispose]: () => void };
            if (typeof disposable[Symbol.dispose] === "function") {
                disposable[Symbol.dispose]();
                continue;
            }

            const asyncDisposable = instance as { [Symbol.asyncDispose]: () => Promise<void> };
            if (typeof asyncDisposable[Symbol.asyncDispose] === "function") {
                await asyncDisposable[Symbol.asyncDispose]();
            }
        }

        if (this.#root) {
            for (const instance of this.#singletonCache.values()) {
                const disposable = instance as { [Symbol.dispose]: () => void };
                if (typeof disposable[Symbol.dispose] === "function") {
                    disposable[Symbol.dispose]();
                    continue;
                }

                const asyncDisposable = instance as { [Symbol.asyncDispose]: () => Promise<void> };
                if (typeof asyncDisposable[Symbol.asyncDispose] === "function") {
                    await asyncDisposable[Symbol.asyncDispose]();
                }
            }

            this.#singletonCache.clear();
        }

        this.#scopedCache.clear();
        // deferefence the singleton cache for the case
        // where it references the parent container.
        this.#singletonCache = new Map();
        this.#resolvers.clear();
    }
}

const services = new ServicesContainer();

// deno-lint-ignore no-explicit-any
const g = globalThis as any;

const GlobalServicesSymbol = Symbol.for("@@BEARZ_GLOBAL_SERVICES");

g[GlobalServicesSymbol] = services;

/**
 * Gets the global services container.
 * @returns The global services container.
 */
export function getServices(): ServicesContainer {
    if (g[GlobalServicesSymbol] && g[GlobalServicesSymbol] instanceof ServicesContainer) {
        return g[GlobalServicesSymbol] as ServicesContainer;
    }

    return services;
}

/**
 * The provider factory config.
 */
export interface ProviderFactoryConfig extends Record<string, unknown> {
    /**
     * The name of the configured instance of the provider
     */
    name: string;
    /**
     * The provider to use to create the instance.
     */
    use: string;
    /**
     * The kind of the provider. e.g. dns, storage, vault, db, etc
     */
    kind: string;
    /**
     * The import directive to use to import the provider factory. This should
     * probably only be used for dynamic imports when using Deno and jsr.io
     */
    import?: string;
    /**
     * The parameters to use when creating the instance.
     */
    with?: Record<string, unknown>;
}

/**
 * The different types of parameters that can be used to create a provider factory config.
 */
export type ProviderFactoryConfigParams = ProviderFactoryConfig | string | URL;

/**
 * Converts a provider factory config params to a provider factory config.
 * @param params The parameters to convert to a provider factory config.
 * @returns The provider factory config.
 */
export function toProviderFactoryConfig(
    params: ProviderFactoryConfigParams,
): ProviderFactoryConfig {
    if (typeof params === "string") {
        return urlToProviderFactoryConfig(new URL(params));
    }

    if (params instanceof URL) {
        return urlToProviderFactoryConfig(params);
    }

    return params;
}

/**
 * Converts a url to a provider factory config.
 * @param url The url to convert to a provider factory config.
 * @returns A provider factory config.
 */
function urlToProviderFactoryConfig(url: URL): ProviderFactoryConfig {
    const use = url.hostname;
    const name = url.searchParams.get("name");
    const importUrl = url.searchParams.get("import");
    const withParams = Object.fromEntries(url.searchParams.entries());
    delete withParams["name"];
    delete withParams["dynamic"];

    return {
        kind: url.protocol.replace(":", ""),
        name: name ?? "default",
        use,
        import: importUrl === null ? undefined : importUrl,
        with: withParams,
    };
}

/**
 * A contract for a provider factory.
 */
export interface ProviderFactory {
    /**
     * Checks if the factory can create an instance of the provider.
     * @param params The parameters to match.
     */
    match(params: ProviderFactoryConfig): boolean;

    /**
     * Creates an instance of the provider.
     * @param params The parameters to create the instance
     * @returns The instance of the provider.
     * @throws An error if the provider could not be created.
     */
    create(params: ProviderFactoryConfig): unknown;
}

/**
 * A special map class that can be used to register and create provider factories.
 */
export class ProviderFactories extends Map<string, ProviderFactory> {
    /**
     * Determines if a factory in the map can be used to create a new instance/service
     * with the given parameters.
     * @param params The parameters to match.
     * @returns `true` if a factory matches the parameters, otherwise `false`.
     */
    match(params: ProviderFactoryConfigParams): boolean {
        params = toProviderFactoryConfig(params);

        for (const factory of this.values()) {
            if (factory.match(params)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determines if a factory in the map can be used to create a new instance/service
     * with the given parameters.
     * @param params The parameters to match.
     * @returns if there is a match, the key of the factory is returned, otherwise `undefined`.
     */
    matchKey(params: ProviderFactoryConfigParams): string | undefined {
        params = toProviderFactoryConfig(params);

        for (const [key, factory] of this.entries()) {
            if (factory.match(params)) {
                return key;
            }
        }

        return undefined;
    }

    /**
     * Dynamically imports a provider factory and registers it with the map if it
     * is not already registered.
     *
     * @description
     *
     * if `${params.kind}://${params.use}` is found as a key in the map, it will return as it
     * is already registered.
     *
     * if the importDirective matches the key, it will attempt to load modules from scopes @spawn, @rex, and @bearz
     *
     * If import url is provided, it will attempt to import the provider factory and register it with the map.
     *
     * If the import url is not provided,
     *
     * @param params The parameters to import a provider factory.
     * @returns `true` if the provider factory was imported, otherwise `false`.
     * @throws  when the import directive is invalid.
     */
    async import(params: ProviderFactoryConfigParams): Promise<boolean> {
        params = toProviderFactoryConfig(params);

        for (const factory of this.values()) {
            if (factory.match(params)) {
                return true;
            }
        }

        const key = `${params.kind}://${params.use}`;

        if (this.has(key) || (params.import && this.has(params.import))) {
            return true;
        }

        let importDirective = params.import ?? params.use;
        if (importDirective === key || importDirective === params.use) {
            const factoryPath = params.with?.["factory-path"] ?? "factory";
            const attempts: string[] = [
                `jsr:@spawn/${params.use}@latest/${factoryPath}`,
                `jsr:@rex/${params.kind}-${params.use}@latest/${factoryPath}`,
                `jsr:@bearz/${params.kind}-${params.use}@latest/${factoryPath}`,
            ];

            let e: Error | undefined = undefined;

            for (const attempt of attempts) {
                try {
                    const { factory } = await import(attempt) as { factory: ProviderFactory };
                    this.set(key, factory);
                    return true;
                } catch (error) {
                    e = new Error(`failed to import ${attempt}`, { cause: toError(error) });
                }
            }

            if (e !== undefined) {
                throw e;
            }
        }

        if (importDirective.includes("@") && importDirective.includes("/")) {
            if (g.process) {
                if (g.Deno) {
                    const hasVersion = params.use.includes("@", params.use.indexOf("/"));
                    if (!hasVersion) {
                        importDirective += "@latest";
                    }

                    if (!importDirective.includes(":")) {
                        importDirective = `jsr:${importDirective}`;
                    }

                    const factoryPath = params.with?.["factory-path"] ?? "factory";
                    importDirective = `${importDirective}/${factoryPath}`;
                    const { factory } = await import(importDirective) as {
                        factory: ProviderFactory;
                    };
                    this.set(key, factory);
                    return true;
                } else {
                    const { factory } = await import(params.use) as { factory: ProviderFactory };
                    this.set(key, factory);
                    return true;
                }
            }
        } else {
            throw new Error(`Invalid import directive for ${key}: ${importDirective}`);
        }

        return false;
    }

    /**
     * Creates an instance of the provider factory.
     * @param params The parameters to create a provider factory.
     * @returns The instance of the provider factory.
     */
    create(params: ProviderFactoryConfigParams): unknown {
        params = toProviderFactoryConfig(params);

        for (const factory of this.values()) {
            if (factory.match(params)) {
                return factory.create(params);
            }
        }

        return undefined;
    }
}

/**
 * The key used to retrieve the instance of `ProviderFactories`.
 */
export const ProviderFactoriesKey = "@@ProviderFactories";

services.registerSingletonValue(ProviderFactoriesKey, new ProviderFactories());

/**
 * Registers a provider factory with the global services container.
 * @param key The key to register the provider factory.
 * @param factory The provider factory
 */
export function registerProviderFactory(key: string, factory: ProviderFactory): void {
    const res = services.require<ProviderFactories>(ProviderFactoriesKey);
    res.unwrap().set(key, factory);
}

/**
 * Creates a provider dynamically.  If the provider factory is not already registered, the function will attempt to import
 * to dynamically import the factory, register it, and then use it to create the provider instance.
 * @param params The parameters to create the provider.
 * @returns The result that is either a Ok result or an Err result. If the provider was created successfully, the
 * result will be a Ok result with the provider instance. Otherwise, the result will be an Err result with an error.
 * @see {@link Result}
 */
export async function createDynamicProvider<T = unknown>(
    params: ProviderFactoryConfigParams,
): Promise<Result<T>> {
    try {
        params = toProviderFactoryConfig(params);

        const res = services.require<ProviderFactories>(ProviderFactoriesKey);
        if (res.isError) {
            return fail(new NotFoundError(ProviderFactoriesKey));
        }

        const factories = res.unwrap();
        const test = `${params.kind}://${params.use}`;
        if (factories.has(test)) {
            return ok(factories.create(params) as T);
        }

        if (!factories.match(params)) {
            if (await factories.import(params)) {
                const instance = factories.create(params);
                if (instance) {
                    return ok(instance as T);
                }
            }

            return fail(
                new NotFoundError(
                    params.use,
                    `No factory found that could create an instance of ${params.kind}/${params.use} for ${params.name}`,
                ),
            );
        }

        const instance = factories.create(params);
        if (instance) {
            return ok(instance as T);
        }

        return fail(
            new NotFoundError(
                params.use,
                `No factory found that could create an instance of ${params.kind}/${params.use} for ${params.name}`,
            ),
        );
    } catch (e) {
        return coerceError(e);
    }
}

/**
 * Creates a provider. If the provider factory is not already registered or if there are any
 * errors when creating the provider, the function will return an error.
 * @param params The parameters to create the provider.
 * @returns The result that is either a Ok result or an Err result. If the provider was created successfully, the
 * result will be a Ok result with the provider instance. Otherwise, the result will be an Err result with an error.
 * @see {@link Result}
 */
export function createProvider<T = unknown>(params: ProviderFactoryConfigParams): Result<T> {
    try {
        params = toProviderFactoryConfig(params);

        const res = services.require<ProviderFactories>(ProviderFactoriesKey);
        if (res.isError) {
            return fail(new NotFoundError(ProviderFactoriesKey));
        }

        const factories = res.unwrap();
        const test = `${params.kind}://${params.use}`;
        if (factories.has(test)) {
            return ok(factories.create(params) as T);
        }

        if (!factories.match(params)) {
            return fail(
                new NotFoundError(
                    params.use,
                    `No factory found that could create an instance of ${params.kind}/${params.use} for ${params.name}`,
                ),
            );
        }

        const instance = factories.create(params);
        if (instance) {
            return ok(instance as T);
        }

        return fail(
            new NotFoundError(
                params.use,
                `No factory found that could create an instance of ${params.kind}/${params.use} for ${params.name}`,
            ),
        );
    } catch (e) {
        return coerceError(e);
    }
}
