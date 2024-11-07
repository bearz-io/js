
export enum Rights {
    ALL_ACCESS = 0xf003f,
    CREATE_LINK = 0x00020,
    CREATE_SUB_KEY = 0x00004,
    ENUMERATE_SUB_KEYS = 0x00008,
    EXECUTE = 0x20019,
    NOTIFY = 0x00010,
    QUERY_VALUE = 0x00001,
    READ = 0x20019,
    SET_VALUE = 0x00002,
    WOW64_32KEY = 0x00200,
    WOW64_64KEY = 0x00100,
    WRITE = 0x20006,
}

export enum Types {
    // Registry value types.
    NONE = 0,
    SZ = 1,
    EXPAND_SZ = 2,
    BINARY = 3,
    DWORD = 4,
    DWORD_BIG_ENDIAN = 5,
    LINK = 6,
    MULTI_SZ = 7,
    RESOURCE_LIST = 8,
    FULL_RESOURCE_DESCRIPTOR = 9,
    RESOURCE_REQUIREMENTS_LIST = 10,
    QWORD = 11,
}

export interface KeyInfo {
    subKeyCount: number;
    maxSubKeyLength: number; // size of the key's subkey with the longest name, in Unicode characters, not including the terminating zero byte
    valueCount: number;
    maxValueNameLength: number; // size of the key's longest value name, in Unicode characters, not including the terminating zero byte
    maxValueLength: number; // longest data component among the key's values, in bytes
    lastWriteTime?: number;
}

export interface Key {
    isNull(): boolean;
    unwrap(): unknown;
    readonly path: string;
    readonly created: boolean,
    close(): void;
    [Symbol.dispose](): void;
    openKey(path: string, access?: number): Key;
    createKey(path: string, access?: number): Key;
    deleteKey(name: string): boolean
    deleteValue(name: string): boolean;
    getSubKeyNames(n?: number): string[];
    getValueNames(n?: number): string[];
    getValue(name: string, buffer?: Uint8Array): { data: Uint8Array; type: number };
    getString(name: string): string;
    getMultiString(name: string): string[];
    getInt32(name: string): number;
    getInt64(name: string): bigint;
    getBinary(name: string): Uint8Array;
    setValue(name: string, data: Uint8Array, type: Types): void;
    setMultiString(name: string, data: string[]): void;
    setBinary(name: string, data: Uint8Array) : void
    setString(name: string, value: string): void;
    setExpandString(name: string, value: string): void;
    setInt32(name: string, value: number): void;
    setInt64(name: string, value: bigint): void;
    stat(): KeyInfo;
}

export const HKEY_CLASSES_ROOT = 0x80000000n;
export const HKEY_CURRENT_USER = 0x80000001n;
export const HKEY_LOCAL_MACHINE = 0x80000002n;
export const HKEY_USERS = 0x80000003n;
export const HKEY_PERFORMANCE_DATA = 0x80000004n;
export const HKEY_CURRENT_CONFIG = 0x80000005n;

export class Registry {

    static get HKCR(): Key {
        throw new Error("property not implemented.");
    }

    static get HKCU(): Key {
        throw new Error("property not implemented.");
    }

    static get HKLM(): Key {
        throw new Error("property not implemented.");
    }

    static get HKU(): Key {
        throw new Error("property not implemented.");
    }

    static get HKPD(): Key {
        throw new Error("property not implemented.");
    }

    static get HKCC(): Key {
        throw new Error("property not implemented.");
    }

    static openKey(path: string, access?: number): Key;
    static openKey(key: Key, path: string, access?: number): Key;
    static openKey(): Key {
        throw new Error("property not implemented.");
    }

    static createKey(key: Key, path: string, access?: number):Key;
    static createKey(path: string, access?: number): Key;
    static createKey(): Key {
        throw new Error("property not implemented.");
    }

    static deleteKey(path: string): void;
    static deleteKey(key: Key, path: string): void;
    static deleteKey(): void {
        throw new Error("property not implemented.");
    }
}