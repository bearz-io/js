import { fail, failAsError, ok, type Result } from "@bearz/functional";
import { NotFoundError } from "@bearz/errors/not-found";
import { getServices, type ServicesContainer } from "./core.ts";
import { toError } from "@bearz/errors/utils";

const services = getServices() as ServicesContainer;

// deno-lint-ignore no-explicit-any
const g = globalThis as any;

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
 * Removes a provider factory from the global services container.
 * @param key The key to remove the provider factory.
 */
export function removeProviderFactory(key: string): void {
    const res = services.require<ProviderFactories>(ProviderFactoriesKey);
    res.unwrap().delete(key);
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
                    `No factory found that could create an instance of ${params.kind}/${params.use} for ${params.name}`,
                    { resource: params.use },
                ),
            );
        }

        const instance = factories.create(params);
        if (instance) {
            return ok(instance as T);
        }

        return fail(
            new NotFoundError(
                `No factory found that could create an instance of ${params.kind}/${params.use} for ${params.name}`,
                { resource: params.use },
            ),
        );
    } catch (e) {
        return failAsError(e);
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
                    `No factory found that could create an instance of ${params.kind}/${params.use} for ${params.name}`,
                    { resource: params.use },
                ),
            );
        }

        const instance = factories.create(params);
        if (instance) {
            return ok(instance as T);
        }

        return fail(
            new NotFoundError(
                `No factory found that could create an instance of ${params.kind}/${params.use} for ${params.name}`,
                { resource: params.use },
            ),
        );
    } catch (e) {
        return failAsError(e);
    }
}
