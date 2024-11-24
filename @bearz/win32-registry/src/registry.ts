/**
 * The Access Rights for the registry key.
 */
export enum Rights {
    /**
     * Full access
     */
    ALL_ACCESS = 0xf003f,
    /**
     * Create a link to the key.
     */
    CREATE_LINK = 0x00020,
    /**
     * Create a subkey.
     */
    CREATE_SUB_KEY = 0x00004,
    /**
     * Enumerate the subkeys.
     */
    ENUMERATE_SUB_KEYS = 0x00008,
    /**
     * Execute a key.
     */
    EXECUTE = 0x20019,
    /**
     * Notify the key.
     */
    NOTIFY = 0x00010,
    /**
     * Query the values from a key.
     */
    QUERY_VALUE = 0x00001,
    /**
     * Read the key.
     */
    READ = 0x20019,
    /**
     * Set value for a key.
     */
    SET_VALUE = 0x00002,
    /**
     * Get access to the 32-bit view of the key.
     */
    WOW64_32KEY = 0x00200,
    /**
     * Get access to the 64-bit view of the key.
     */
    WOW64_64KEY = 0x00100,
    /**
     * Write the key.
     */
    WRITE = 0x20006,
}

/**
 * The value types for the registry key.
 */
export enum Types {
    // Registry value types.
    NONE = 0,
    /**
     * A null-terminated string.
     */
    SZ = 1,
    /**
     * A null-terminated string that contains unexpanded references to environment variables.
     */
    EXPAND_SZ = 2,
    /**
     * Binary data in any form.
     */
    BINARY = 3,
    /**
     * A 32-bit number.
     */
    DWORD = 4,
    /**
     * A 32-bit number in big-endian format.
     */
    DWORD_BIG_ENDIAN = 5,
    /**
     * A symbolic link.
     */
    LINK = 6,
    /**
     * An array of null-terminated strings, terminated by two null characters.
     */
    MULTI_SZ = 7,
    /**
     * A resource list in the resource requirements list.
     */
    RESOURCE_LIST = 8,
    /**
     * A resource descriptor in the resource requirements list.
     */
    FULL_RESOURCE_DESCRIPTOR = 9,
    /**
     * A resource requirements list.
     */
    RESOURCE_REQUIREMENTS_LIST = 10,
    /**
     * A 64-bit number.
     */
    QWORD = 11,
}

/**
 * Information about a registry key.
 */
export interface KeyInfo {
    /**
     * The number of subkeys that the key has.
     */
    subKeyCount: number;
    /**
     * The maximum length of the key's subkey with the longest name, in Unicode characters, not including the terminating zero byte.
     */
    maxSubKeyLength: number;
    /**
     * The number of values that the key has.
     */
    valueCount: number;
    /**
     * The maximum length of the key's value name, in Unicode characters, not including the terminating zero byte.
     */
    maxValueNameLength: number;
    /**
     * The maximum length of the key's values, in bytes.
     */
    maxValueLength: number;
    /**
     * The last write time of the key.
     */
    lastWriteTime?: number;
}

/**
 * Represents a registry key.
 */
export interface Key {
    /**
     * Returns true if the key is null.
     * @returns `true` if the key is null; otherwise, `false`.
     */
    isNull(): boolean;
    /**
     * Returns the underlying handle.
     * @returns The underlying handle.
     */
    unwrap(): unknown;
    /**
     * Gets the path of the key.
     */
    readonly path: string;
    /**
     * Gets a value indicating whether the key was created.
     * @returns `true` if the key was created; otherwise, `false`.
     */
    readonly created: boolean;
    /**
     * Close the key, effectively releasing the handle and disposing the key.
     */
    close(): void;
    /**
     * Dispose the key, effectively releasing the handle and disposing the key.
     */
    [Symbol.dispose](): void;
    /**
     * Open a subkey.
     * @param path The path of the subkey to open.
     * @param access The access rights to open the key with. Defaults to `Rights.ALL_ACCESS`.
     * @returns The opened key.
     */
    openKey(path: string, access?: number): Key;
    /**
     * Create a subkey.
     * @param path The path of the subkey to open.
     * @param access The access rights to open the key with. Defaults to `Rights.ALL_ACCESS`.
     * @returns The created key.
     */
    createKey(path: string, access?: number): Key;
    /**
     * Delete a subkey.
     * @param name The name of the key to delete.
     * @returns `true` if the key was deleted; otherwise, `false`.
     */
    deleteKey(name: string): boolean;
    /**
     * Delete a value.
     * @param name The name of the value to delete.
     * @returns `true` if the value was deleted; otherwise, `false`.
     */
    deleteValue(name: string): boolean;
    /**
     * Get the names of the subkeys.
     * @param n The maximum number of subkey names to retrieve.
     * @remarks If `n` is not specified, all value names are returned.
     * @returns The names of the subkeys.
     */
    getSubKeyNames(n?: number): string[];
    /**
     * Get the names of the values.
     * @param n The maximum number of value names to retrieve.
     * @remarks If `n` is not specified, all value names are returned.
     * @returns The names of the values.
     */
    getValueNames(n?: number): string[];
    /**
     * Gets the raw value as a binary buffer.
     * @param name The name of the value to retrieve.
     * @param buffer The buffer to store the value data.
     * @returns The value data and type.
     */
    getValue(name: string, buffer?: Uint8Array): { data: Uint8Array; type: number };
    /**
     * Gets the value as a string.
     * @param name The name of the value to retrieve.
     * @returns The string value.
     */
    getString(name: string): string;
    /**
     * Gets the value as a string array.
     * @param name The name of the value to retrieve.
     * @returns The string array.
     */
    getMultiString(name: string): string[];
    /**
     * Gets the int32 value, which is often referred to as DWORD in the Windows registry.
     * @param name The name of the value to retrieve.
     * @returns The int32 value.
     */
    getInt32(name: string): number;
    /**
     * Gets the big integer value, which is often referred to as QWORD in the Windows registry or long.
     * @param name The name of the value to retrieve.
     * @returns The big integer value.
     */
    getInt64(name: string): bigint;
    /**
     * Gets binary data.
     * @param name The name of the value to retrieve.
     * @returns The binary data.
     */
    getBinary(name: string): Uint8Array;
    /**
     * Sets the raw value as a binary buffer.
     * @param name The name of the value to set.
     * @param data The data to set.
     * @param type The type of the data.
     */
    setValue(name: string, data: Uint8Array, type: Types): void;
    /**
     * Sets the multi-string value.
     * @param name The name of the value to set.
     * @param value The value to set.
     */
    setMultiString(name: string, value: string[]): void;
    /**
     * Sets the binary value.
     * @param name The name of the value to set.
     * @param data The data to set.
     */
    setBinary(name: string, data: Uint8Array): void;
    /**
     * Sets the string value.
     * @param name The name of the value to set.
     * @param value The value to set.
     */
    setString(name: string, value: string): void;
    /**
     * Sets the expand string value.
     * @param name The name of the value to set.
     * @param value The value to set.
     */
    setExpandString(name: string, value: string): void;
    /**
     * Sets the int32 value, which is often referred to as DWORD in the Windows registry.
     * @param name The name of the value to set.
     * @param value The value to set.
     */
    setInt32(name: string, value: number): void;
    /**
     * Sets the big integer value, which is often referred to as QWORD in the Windows registry or long.
     * @param name The name of the value to set.
     * @param value The value to set.
     */
    setInt64(name: string, value: bigint): void;
    /**
     * Get the key information.
     * @returns The key information.
     */
    stat(): KeyInfo;
}

export const HKEY_CLASSES_ROOT = 0x80000000n;
export const HKEY_CURRENT_USER = 0x80000001n;
export const HKEY_LOCAL_MACHINE = 0x80000002n;
export const HKEY_USERS = 0x80000003n;
export const HKEY_PERFORMANCE_DATA = 0x80000004n;
export const HKEY_CURRENT_CONFIG = 0x80000005n;

/**
 * The static Registry class which is the primary entry point for working with the Windows registry.
 */
export class Registry {
    /**
     * Returns the key for `HKEY_CLASSES_ROOT`.
     */
    static get HKCR(): Key {
        throw new Error("property not implemented.");
    }

    /**
     * Returns the key for `HKEY_CURRENT_USER`.
     */
    static get HKCU(): Key {
        throw new Error("property not implemented.");
    }

    /**
     * Returns the key for `HKEY_LOCAL_MACHINE`.
     */
    static get HKLM(): Key {
        throw new Error("property not implemented.");
    }

    /**
     * Returns the key for `HKEY_USERS`.
     */
    static get HKU(): Key {
        throw new Error("property not implemented.");
    }

    /**
     * Returns the key for `HKEY_PERFORMANCE_DATA`.
     */
    static get HKPD(): Key {
        throw new Error("property not implemented.");
    }

    /**
     * Returns the key for `HKEY_CURRENT_CONFIG`.
     */
    static get HKCC(): Key {
        throw new Error("property not implemented.");
    }

    /**
     * Open a registry key.
     * @param path The path of the key to open.
     * @param access The access rights to open the key with. Defaults to `Rights.ALL_ACCESS`.
     * @returns The opened key.
     */
    static openKey(path: string, access?: number): Key;
    /**
     * Open a registry key.
     * @param key The parent key.
     * @param path The path of the key to open.
     * @param access The access rights to open the key with. Defaults to `Rights.ALL_ACCESS`.
     * @returns The opened key.
     */
    static openKey(key: Key, path: string, access?: number): Key;
    static openKey(): Key {
        throw new Error("property not implemented.");
    }

    /**
     * Create a registry key.
     * @param key The parent key.
     * @param path The path of the key to create.
     * @param access The access rights to create the key with. Defaults to `Rights.ALL_ACCESS`.
     * @returns The created key.
     */
    static createKey(key: Key, path: string, access?: number): Key;
    /**
     * Create a registry key.
     * @param path The path of the key to create.
     * @param access The access rights to create the key with. Defaults to `Rights.ALL_ACCESS`.
     * @returns The created key.
     */
    static createKey(path: string, access?: number): Key;
    static createKey(): Key {
        throw new Error("property not implemented.");
    }

    /**
     * Delete a registry key.
     * @param path The path of the key to delete.
     */
    static deleteKey(path: string): void;
    /**
     * Delete a registry key.
     * @param path The path of the key to delete.
     * @param key The parent key.
     */
    static deleteKey(key: Key, path: string): void;
    static deleteKey(): void {
        throw new Error("property not implemented.");
    }
}
