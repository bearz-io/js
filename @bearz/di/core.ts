import { fail, failAsError, ok, type Result } from "@bearz/functional";
import { NotFoundError } from "@bearz/errors/not-found";

/**
 * The service provider interface.
 */
export interface ServiceProvider extends AsyncDisposable, Disposable {
    /**
     * Enumerates all services of a given key.
     * @param key The key to get the service.
     */
    enumerate<T = unknown>(key: string): T[];

    /**
     * Creates a service of a given key. If multiple services are registered,
     * the first one will be returned.
     * @param key The key to get the service.
     * @returns The service or undefined if the service is not registered.
     */
    get<T = unknown>(key: string): T | undefined;

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
    require<T = unknown>(key: string): Result<T>;

    /**
     * Creates a new scope for the container. A scope is a child container
     * that inherits singleton instances from the parent container and creates new instances of scoped services
     * and transient services.
     *
     * When the child container is disposed, it will dispose of
     * all scoped instances that are disposable.
     */
    createScope(): ServiceProvider;
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
    #singletonCache: Map<string, unknown[]> = new Map();
    #scopedCache: Map<string, unknown[]> = new Map();
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
        const cache = this.#singletonCache.get(key) ?? [];
        cache[0] = value;
        this.#singletonCache.set(key, cache);
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
        let index = 0;
        for (const descriptor of descriptors) {
            switch (descriptor.lifecycle) {
                case "singleton":
                    results.push(this.resolveSingleton(descriptor, index) as T);
                    break;
                case "transient":
                    results.push(descriptor.factory(this) as T);
                    break;
                case "scoped":
                    results.push(this.resolveScoped(descriptor, index) as T);
                    break;
            }

            index++;
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
            return failAsError(e);
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
     * Builds the collection into a ServiceProvider.
     * @returns The ServiceProvider.
     */
    build(): ServiceProvider {
        // build is here as a placeholder for future functionality.

        return this;
    }

    /**
     * Resolves a scoped instance which is local to the container. If the instance is not already created,
     * it will create it and cache it once per scope.
     * @param descriptor The descriptor to resolve.
     * @returns The scoped instance of the service.
     */
    private resolveScoped(descriptor: Descriptor, index = 0): unknown {
        if (this.#scopedCache.has(descriptor.key)) {
            const cache = this.#scopedCache.get(descriptor.key) ?? [];
            if (index < cache.length) {
                return cache[index];
            }
        }

        const instance = descriptor.factory(this);
        const cache = this.#scopedCache.get(descriptor.key) ?? [];
        cache[index] = instance;
        this.#scopedCache.set(descriptor.key, cache);
        return instance;
    }

    /**
     * Resolves a singleton instance which is global. If the instance is not already created,
     * it will create it and cache it once globally.
     * @param descriptor The descriptor to resolve.
     * @returns The singleton instance of the service.
     */
    private resolveSingleton(descriptor: Descriptor, index = 0): unknown {
        if (this.#singletonCache.has(descriptor.key)) {
            const cache = this.#singletonCache.get(descriptor.key) ?? [];
            if (index < cache.length) {
                return cache[index];
            }
        }

        const instance = descriptor.factory(this);
        const cache = this.#singletonCache.get(descriptor.key) ?? [];
        cache[index] = instance;
        this.#singletonCache.set(descriptor.key, cache);
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
        for (const cache of scoped) {
            for (const instance of cache) {
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
        }

        if (this.#root) {
            const global = Array.from(this.#singletonCache.values());
            for (const cache of global) {
                for (const instance of cache) {
                    const disposable = instance as { [Symbol.dispose]: () => void };
                    if (typeof disposable[Symbol.dispose] === "function") {
                        disposable[Symbol.dispose]();
                        continue;
                    }

                    const asyncDisposable = instance as {
                        [Symbol.asyncDispose]: () => Promise<void>;
                    };
                    if (typeof asyncDisposable[Symbol.asyncDispose] === "function") {
                        asyncDisposable[Symbol.asyncDispose]();
                    }
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
        for (const cache of scoped) {
            for (const instance of cache) {
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
        }

        if (this.#root) {
            const global = Array.from(this.#singletonCache.values());
            for (const cache of global) {
                for (const instance of cache) {
                    const disposable = instance as { [Symbol.dispose]: () => void };
                    if (typeof disposable[Symbol.dispose] === "function") {
                        disposable[Symbol.dispose]();
                        continue;
                    }

                    const asyncDisposable = instance as {
                        [Symbol.asyncDispose]: () => Promise<void>;
                    };
                    if (typeof asyncDisposable[Symbol.asyncDispose] === "function") {
                        await asyncDisposable[Symbol.asyncDispose]();
                    }
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

const GlobalServicesSymbol = Symbol.for("@@BEARZ_GLOBAL_DI_SERVICES");

g[GlobalServicesSymbol] = services;

/**
 * Gets the global services container.
 * @returns The global services container.
 */
export function getServices(): ServiceProvider {
    if (g[GlobalServicesSymbol] && g[GlobalServicesSymbol] instanceof ServicesContainer) {
        return g[GlobalServicesSymbol] as ServiceProvider;
    }

    return services as ServiceProvider;
}
