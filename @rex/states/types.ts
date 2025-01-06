/**
 * Storage for persisting state data.
 */
export interface StateStore {
    /**
     * The name of the store.
     */
    readonly name: string;
    /**
     * The type of driver such as 'file', 'database', etc.
     */
    readonly driver: string;

    /**
     * Gets the value of a state data at the specified path.
     * @param path The path to the state data.
     */
    get<T = unknown>(path: string): Promise<T | undefined>;

    /**
     * Sets the value of a state data at the specified path.
     * @param path The path to the state data.
     * @param value The value to set.
     */
    set<T = unknown>(path: string, value: T): Promise<void>;

    /**
     * Deletes the state data at the specified path.
     * @param path The path to the state data.
     */
    delete(path: string): Promise<void>;
}

/**
 * The parameters for creating a state driver.
 */
export interface StateDriverParams extends Record<string, unknown> {
    /**
     * The name of the state driver.
     */
    name: string;
    /**
     * The type of state driver to create.
     */
    use?: "file" | string;
    /**
     * The URI of the state driver.
     */
    uri?: string;
    /**
     * The configuration for the state driver.
     */
    with?: Record<string, unknown>;
    /**
     * If the state driver already exists, replace the existing driver
     * by name.
     */
    replace?: boolean;
}

/**
 * A factory that creates state drivers.
 */
export interface StateDriverFactory {
    /**
     * Can the factory build a state driver with the specified parameters.
     * @param params The parameters for creating the state driver.
     */
    canBuild(params: StateDriverParams): boolean;
    /**
     * The factory builds a state driver with the specified parameters.
     * @param params The parameters for creating the state driver.
     * @returns A promise that resolves to the state driver.
     * @throws If the state driver cannot be created or can not load
     * the module that creates the state driver.
     */
    build(params: StateDriverParams): Promise<StateStore>;
}
