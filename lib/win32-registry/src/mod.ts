
// Windows types
const HKEY = "pointer";
const DWORD = "u32";
const LONG = "i32";
const LPCTSTR = "pointer";
const LPTSTR = "pointer";
const REGSAM = "u32";
const PHKEY = "pointer";
const LPDWORD = "u32";
const Pointer = "pointer";

// Load advapi32.dll
const advapi32 = Deno.dlopen("advapi32.dll", {
    RegOpenKeyExW: {
      parameters: [HKEY, LPCTSTR, DWORD, REGSAM, PHKEY],
      result: LONG,
    },
    RegCloseKey: {
      parameters: [HKEY],
      result: LONG,
    },
    RegQueryValueExW: {
      parameters: [HKEY, LPCTSTR, Pointer, Pointer, Pointer, Pointer],
      result: LONG,
    },
    RegSetValueExW: {
      parameters: [HKEY, LPCTSTR, DWORD, DWORD, LPTSTR, DWORD],
      result: LONG,
    },
    RegCreateKeyExW: {
      parameters: [HKEY, LPCTSTR, DWORD, LPCTSTR, DWORD, REGSAM, Pointer, PHKEY, Pointer],
      result: LONG,
    },
    RegDeleteKeyW: {
      parameters: [HKEY, LPCTSTR],
      result: LONG,
    },
    RegEnumKeyExW: {
        parameters: [HKEY, DWORD, LPTSTR, Pointer, Pointer, LPTSTR, Pointer, Pointer],
        result: LONG,
    },
    RegEnumValueW: {
        parameters: [HKEY, DWORD, LPTSTR, Pointer, Pointer, Pointer, Pointer, Pointer],
        result: LONG,
    },
    RegQueryInfoKeyW: {
        parameters: [HKEY, LPTSTR, Pointer, Pointer, Pointer, Pointer, Pointer, Pointer, Pointer, Pointer,Pointer, Pointer],
        result: LONG,
    },
  });
  

export enum Rights {
    ALL_ACCESS         = 0xf003f,
	CREATE_LINK        = 0x00020,
	CREATE_SUB_KEY     = 0x00004,
	ENUMERATE_SUB_KEYS = 0x00008,
	EXECUTE            = 0x20019,
	NOTIFY             = 0x00010,
	QUERY_VALUE        = 0x00001,
	READ               = 0x20019,
	SET_VALUE          = 0x00002,
	WOW64_32KEY        = 0x00200,
	WOW64_64KEY        = 0x00100,
	WRITE              = 0x20006,
}

export enum Types {
    	// Registry value types.
	NONE                       = 0,
	SZ                         = 1,
	EXPAND_SZ                  = 2,
	BINARY                     = 3,
	DWORD                      = 4,
	DWORD_BIG_ENDIAN           = 5,
	LINK                       = 6,
	MULTI_SZ                   = 7,
	RESOURCE_LIST              = 8,
	FULL_RESOURCE_DESCRIPTOR   = 9,
	RESOURCE_REQUIREMENTS_LIST = 10,
	QWORD                      = 11
}

const _REG_OPTION_NON_VOLATILE = 0

const _REG_CREATED_NEW_KEY     = 1
const _REG_OPENED_EXISTING_KEY = 2

const _ERROR_NO_MORE_ITEMS  = 259;

export interface KeyInfo {
	subKeyCount:    number
	maxSubKeyLength:    number // size of the key's subkey with the longest name, in Unicode characters, not including the terminating zero byte
	valueCount:      number
	maxValueNameLength: number // size of the key's longest value name, in Unicode characters, not including the terminating zero byte
	maxValueLength:     number // longest data component among the key's values, in bytes
	lastWriteTime?:  number
}

export interface Key {
    isNull(): boolean;
    unwrap(): unknown;
    path: string
    close() : void 
    [Symbol.dispose]() : void
    openKey(path: string, access?: Rights): Key;
    createKey(path: string, access?: Rights): { key: Key, openedExisting: boolean };
    getSubKeyNames(n?: number): string[];
    getValueNames(n?: number): string[];
    getValue(name: string, buffer?: Uint8Array): { data: Uint8Array, type: number };
    getString(name: string): string;
    getInt(name: string): number;
    getInt64(name: string): bigint;
    getBinary(name: string): Uint8Array;
    deleteKey(name: string): boolean;
    setValue(name: string, data: Uint8Array, type: Types): void;
    setString(name: string, value: string): void;
    setExpandString(name: string, value: string): void;
    setInt(name: string, value: number): void;
    setInt64(name: string, value: bigint): void;
    stat(): KeyInfo;
}


class KeyHandle implements Key {
    #ptr: unknown | null = null;
    #path: string
    #disposed: boolean

    constructor(ptr: unknown | null, path: string) {
        this.#ptr = ptr;
        this.#path = path;
        this.#disposed= false;
    }

    isNull(): boolean {
        return this.#ptr === null;
    }

    unwrap(): unknown {
        if (this.#ptr === null) {
            throw new Error("KeyHandle is null");
        }
        return this.#ptr;
    }

    get path() :string {
        return this.#path;
    }

    close(): void {
        if (this.#disposed)
            return
        advapi32.symbols.RegCloseKey(this.unwrap() as Deno.PointerValue);
        this.#disposed = true
        this.#ptr = null;
    }

    [Symbol.dispose]() {
        this.close();
    }

    openKey(path: string, access: Rights = Rights.ALL_ACCESS): Key {
        if (this.#disposed)
            throw new Error (`Key ${this.path} is already disposed.`);
        return openKey(this, path, access);
    }

    createKey(path: string, access: Rights = Rights.ALL_ACCESS): { key: Key, openedExisting: boolean } {
        if (this.#disposed)
            throw new Error (`Key ${this.path} is already disposed.`);
        return createKey(this, path, access);
    }

    deleteKey(name: string) : boolean {
        deleteKey(this, name);
        return true;
    }

    getSubKeyNames(n : number = 0): string[] {
        if (this.#disposed)
            throw new Error (`Key ${this.path} is already disposed.`);
        if (!Number.isInteger(n) || n < 0) {
            n = 0;
        }

        let buf = new Uint16Array(256);
        let length = new Uint32Array(1);
        let i = 0;
        let result: number;
        const names: string[] = [];
        let done = false;
        let name = "";
        while(true) {
            if (n > 0 && names.length === n) {
                return names;
            }

            length = new Uint32Array([buf.length]);
            while(true) {
                result = advapi32.symbols.RegEnumKeyExW(
                    this.unwrap() as Deno.PointerValue,
                    i,
                    Deno.UnsafePointer.of(buf),
                    Deno.UnsafePointer.of(length),
                    null,
                    null,
                    null,
                    null,
                );
    
                if (result === 234) {
                    const l2 = length[0] * 2;
                    length = new Uint32Array([l2]);
                    buf = new Uint16Array(l2);
                    continue;
                }

                if (result === _ERROR_NO_MORE_ITEMS) {
                    done = true;
                    break;
                }

                if (result !== 0) {
                    throw new Error(`Failed to enumerate value names.  Error: ${result}`);
                }

                name = new TextDecoder("utf-16").decode(buf); 
                i++;
                break;
            }

            names.push(name);

            if (done) {
                return names;
            }
        }
    }

    getValue(name: string, buffer?: Uint8Array) : { data: Uint8Array, type: number } {
        if (this.#disposed)
            throw new Error (`Key ${this.path} is already disposed.`);
        const p = pwstrPointer(name);
        const t = new Uint32Array([0]);
        buffer ??= new Uint8Array(255);
        const n = new Uint32Array([buffer.length]);

        const id = Deno.UnsafePointer.value(this.unwrap() as Deno.PointerValue);

        while (true) {
            const result = advapi32.symbols.RegQueryValueExW(
                this.unwrap() as Deno.PointerValue,
                p,
                null,
                Deno.UnsafePointer.of(t),
                Deno.UnsafePointer.of(buffer),
                Deno.UnsafePointer.of(n),
            );

            if (result === 0) {
                return {
                    data: buffer.slice(0, n[0]),
                    type: t[0],
                }
            }

            if (result === 6) {
                throw new Error(`Invalid handle ${id} for ${this.path}\\${name}. Error code ${result}`)
            }

            if (result == 2) {
                throw new Error(`Unable to find ${this.path}\\${name}. Error code ${result}`);
            }

            if (result === 234) {
                n[0] = n[0] * 2;
                buffer = new Uint8Array(n[0]);
                continue;
            }

            throw new Error(`"Failed to query value ${name}.  Error: ${result}`);
        }     
    }

    getBinary(name: string): Uint8Array {
        const result = this.getValue(name);
        if (result.type !== Types.BINARY) {
            throw new Error(`Value ${name} is not a binary`);
        }

        return result.data;
    }

    getString(name: string): string {
        const result = this.getValue(name, new Uint8Array(64));
        if (result.type !== Types.SZ && result.type !== Types.EXPAND_SZ) {
            throw new Error(`Value ${name} is not a string`);
        }

        return new TextDecoder("utf-16").decode(result.data);
    }

    getInt(name: string): number {
        const result = this.getValue(name, new Uint8Array(4));
        if (result.type !== Types.DWORD) {
            throw new Error(`Value ${name} is not a DWORD`);
        }

        return new DataView(result.data.buffer).getInt32(0, true);
    }

    getInt64(name: string): bigint {
        const result = this.getValue(name, new Uint8Array(8));
        if (result.type !== Types.QWORD) {
            throw new Error(`Value ${name} is not a QWORD`);
        }

        return new DataView(result.data.buffer).getBigInt64(0, true);
    }

    setValue(name: string, data: Uint8Array, type: Types): void {
        const p = pwstrPointer(name);
        const result = advapi32.symbols.RegSetValueExW(
            this.unwrap() as Deno.PointerValue,
            p,
            0,
            type,
            Deno.UnsafePointer.of(data),
            data.length,
        );

        if (result !== 0) {
            throw new Error(`Failed to set value ${name}`);
        }
    }

    setString(name: string, value: string): void {
        this.setStringType(name, value, Types.SZ);
    }

    setExpandString(name: string, value: string): void {
        this.setStringType(name, value, Types.EXPAND_SZ);
    }

    setInt(name: string, value: number): void {
        const data = new Uint8Array(4);
        new DataView(data.buffer).setInt32(0, value, true);
        this.setValue(name, data, Types.DWORD);
    }

    setInt64(name: string, value: bigint): void {
        const data = new Uint8Array(8);
        new DataView(data.buffer).setBigInt64(0, value, true);
        this.setValue(name, data, Types.QWORD);
    }


    stat() {
        const subKeyCount = new Uint32Array(1);
        const maxSubKeyLength = new Uint32Array(1);
        const valueCount = new Uint32Array(1);
        const maxValueNameLength = new Uint32Array(1);
        const maxValueLength = new Uint32Array(1);
        const modified = new BigUint64Array(1);
    
        const result = advapi32.symbols.RegQueryInfoKeyW(
            this.unwrap() as Deno.PointerValue,
            null,
            null,
            null,
            Deno.UnsafePointer.of(subKeyCount),
            Deno.UnsafePointer.of(maxSubKeyLength),
            null,
            Deno.UnsafePointer.of(valueCount),
            Deno.UnsafePointer.of(maxValueNameLength),
            Deno.UnsafePointer.of(maxValueLength),
            null,
            Deno.UnsafePointer.of(modified),
        );
    
        if (result !== 0) {
            throw new Error("Failed to query key info");
        }
    
        return {
            subKeyCount: subKeyCount[0],
            maxSubKeyLength: maxSubKeyLength[0],
            valueCount: valueCount[0],
            maxValueNameLength: maxValueNameLength[0],
            maxValueLength: maxValueLength[0],
            lastWriteTime: Number(modified[0]),
        } as KeyInfo;
    }

    protected setStringType(name: string, value: string, type: Types): void {
        const data = new TextEncoder().encode(value);

        this.setValue(name, data, type);
    }

    getValueNames(n: number = 0): string[] {
        if (!Number.isInteger(n) || n < 0) {
            n = 0;
        }

        const ki = this.stat();
        let buf = new Uint16Array(ki.maxValueNameLength + 1);
        let length = new Uint32Array(1);
        let i = 0;
        let result: number;
        const names: string[] = new Array<string>(ki.valueCount);
        let done = false;
        let name = "";
        while(true) {
            if (n > 0 && names.length === n) {
                return names;
            }

            length = new Uint32Array([buf.length]);
            while(true) {
                result = advapi32.symbols.RegEnumValueW(
                    this.unwrap() as Deno.PointerValue,
                    i,
                    Deno.UnsafePointer.of(buf),
                    Deno.UnsafePointer.of(length),
                    null,
                    null,
                    null,
                    null,
                );
    
                if (result === 234) {
                    const l2 = length[0] * 2;
                    length = new Uint32Array([l2]);
                    buf = new Uint16Array(l2);
                    continue;
                }

                if (result === _ERROR_NO_MORE_ITEMS) {
                    done = true;
                    break;
                }

                if (result !== 0) {
                    console.log(names);
                    throw new Error(`Failed to enumerate value names.  Error: ${result}`);
                }

                name = new TextDecoder("utf-16").decode(buf); 
                i++;
                break;
            }

            names.push(name);
            if (names.length === ki.valueCount) {
                return names 
            }

            if (done) {
                return names;
            }
        }
    }
}

function pwstr(s: string | Uint16Array | Uint8Array | Uint32Array): Uint8Array {
    if (typeof s === "string") {
        const u8 = new TextEncoder().encode(s + "\0");
        const u16 = new Uint16Array(u8);
        return new Uint8Array(u16.buffer);
    }

    if (s instanceof Uint8Array) {
        return s;
    }

    if (s instanceof Uint16Array) {
        return new Uint8Array(s.buffer);
    }

    if (s instanceof Uint32Array) {
        return new Uint8Array(s.buffer);
    }

    return new Uint8Array(0);
}

function pwstrPointer(s: string | Uint16Array | Uint8Array | Uint32Array): Deno.PointerValue {
    const buffer = pwstr(s);
    return Deno.UnsafePointer.of(buffer);
}

function openKey(k: Key, path: string | Uint8Array | Uint16Array, access: number): Key {
    const p = pwstrPointer(path);
    const subkey = new BigUint64Array(1);
    const subkeyPtr = Deno.UnsafePointer.of(subkey);

    const result = advapi32.symbols.RegOpenKeyExW(
        k.unwrap() as Deno.PointerValue,
        p,
        0,
        access,
        subkeyPtr,
    );

    const id = subkey[0];
    const handle = Deno.UnsafePointer.create(id);

    if (result !== 0) {
        throw new Error("Failed to open key");
    }

    return new KeyHandle(handle, k.path + "\\" + path);
}

function createKey(k: Key, path: string | Uint8Array | Uint16Array, access: number): { key: Key, openedExisting: boolean } {
    const p = pwstrPointer(path);
    const subkey = new BigUint64Array(1);
    const subkeyPtr = Deno.UnsafePointer.of(subkey);
    const disposition = new Uint32Array(1);
    const dispositionPtr = Deno.UnsafePointer.of(disposition);

    const result = advapi32.symbols.RegCreateKeyExW(
        k.unwrap() as Deno.PointerValue,
        p,
        0,
        null,
        _REG_OPTION_NON_VOLATILE,
        access,
        null,
        subkeyPtr,
        dispositionPtr,
    );

    if (result !== 0) {
        throw new Error("Failed to create key");
    }

    const id = Deno.UnsafePointer.value(subkeyPtr);
    const handle = Deno.UnsafePointer.create(id);
    const h = new KeyHandle(handle, k.path + "\\" + path);
    return { key: h, openedExisting: disposition[0] === _REG_OPENED_EXISTING_KEY };
}

function deleteKey(k: Key, path: string | Uint8Array | Uint16Array): void {
    const p = pwstrPointer(path);
    const result = advapi32.symbols.RegDeleteKeyW(
        k.unwrap() as Deno.PointerValue,
        p,
    );

    if (result !== 0) {
        throw new Error("Failed to delete key");
    }
}

export const HKEY_CLASSES_ROOT = 0x80000000n;
export const HKEY_CURRENT_USER = 0x80000001n;
export const HKEY_LOCAL_MACHINE = 0x80000002n;
export const HKEY_USERS = 0x80000003n;
export const HKEY_PERFORMANCE_DATA = 0x80000004n;
export const HKEY_CURRENT_CONFIG = 0x80000005n;


export class Registry {
    static #hkcr?: Key;
    static #hkcu?: Key;
    static #hklm?: Key;
    static #hku?: Key;
    static #hkpd?: Key;
    static #hkcc?: Key;


    static get HKCR(): Key {
        if (this.#hkcr === undefined) {
            this.#hkcr = new KeyHandle(Deno.UnsafePointer.create(HKEY_CLASSES_ROOT), "HKCR");
        }

        return this.#hkcr;
    }

    static get HKCU(): Key {
        if (this.#hkcu === undefined) {
            this.#hkcu = new KeyHandle(Deno.UnsafePointer.create(HKEY_CURRENT_USER), "HKCU");
        }

        return this.#hkcu;
    }

    static get HKLM(): Key {
        if (this.#hklm === undefined) {
            this.#hklm = new KeyHandle(Deno.UnsafePointer.create(HKEY_LOCAL_MACHINE), "HKLM");
        }

        return this.#hklm;
    }

    static get HKU(): Key {
        if (this.#hku === undefined) {
            this.#hku = new KeyHandle(Deno.UnsafePointer.create(HKEY_USERS), "HKU");
        }

        return this.#hku;
    }

    static get HKPD(): Key {
        if (this.#hkpd === undefined) {
            this.#hkpd = new KeyHandle(Deno.UnsafePointer.create(HKEY_PERFORMANCE_DATA), "HKPD");
        }

        return this.#hkpd;
    }

    static get HKCC(): Key {
        if (this.#hkcc === undefined) {
            this.#hkcc = new KeyHandle(Deno.UnsafePointer.create(HKEY_CURRENT_CONFIG), "HKCC");
        }

        return this.#hkcc;
    }


    static openKey(path: string, access: number): Key 
    static openKey(key: Key, path: string, access: number): Key
    static openKey(): Key {
        switch (arguments.length) {
            case 2:
                {
                    let path = arguments[0] as string
                    path = path.replaceAll("/", "\\");
                    const hiveName = path.substring(0, path.indexOf("\\"));
                    path = path.substring(path.indexOf("\\") + 1);
                    switch (hiveName) {
                        case "HKCR":
                        case "HKEY_CLASSES_ROOT":
                            return openKey(this.HKCR, path, arguments[1]);
                        case "HKCU":
                        case "HKEY_CURRENT_USER":
                            return openKey(this.HKCU, path, arguments[1]);
                        case "HKLM":
                        case "HKEY_LOCAL_MACHINE":
                            return openKey(this.HKLM, path, arguments[1]);
                        case "HKU":
                        case "HKEY_USERS":
                            return openKey(this.HKU, path, arguments[1]);
                        case "HKPD":
                        case "HKEY_PERFORMANCE_DATA":
                            return openKey(this.HKPD, path, arguments[1]);
                        case "HKCC":
                        case "HKEY_CURRENT_CONFIG":
                            return openKey(this.HKCC, path, arguments[1]);
                        default:
                            throw new Error("Invalid hive name");
                    }
                }
                break;

            case 3:
                {
                    return openKey(arguments[0] as Key, arguments[1] as string, arguments[2] as number);
                }

            default:
                throw new Error("Invalid number of arguments");
        }
    }

    static createKey(key: Key, path: string, access: number): { key: Key, openedExisting: boolean }
    static createKey(path: string, access: number): { key: Key, openedExisting: boolean }
    static createKey(): { key: Key, openedExisting: boolean } {
        switch (arguments.length) {
            case 2:
                {
                    let path = arguments[0] as string
                    path = path.replaceAll("/", "\\");
                    const hiveName = path.substring(0, path.indexOf("\\"));
                    path = path.substring(path.indexOf("\\") + 1);
                    switch (hiveName) {
                        case "HKCR":
                        case "HKEY_CLASSES_ROOT":
                            return createKey(this.HKCR, path, arguments[1]);
                        case "HKCU":
                        case "HKEY_CURRENT_USER":
                            return createKey(this.HKCU, path, arguments[1]);
                        case "HKLM":
                        case "HKEY_LOCAL_MACHINE":
                            return createKey(this.HKLM, path, arguments[1]);
                        case "HKU":
                        case "HKEY_USERS":
                            return createKey(this.HKU, path, arguments[1]);
                        case "HKPD":
                        case "HKEY_PERFORMANCE_DATA":
                            return createKey(this.HKPD, path, arguments[1]);
                        case "HKCC":
                        case "HKEY_CURRENT_CONFIG":
                            return createKey(this.HKCC, path, arguments[1]);
                        default:
                            throw new Error("Invalid hive name");
                    }
                }
                break;

            case 3:
                {
                    return createKey(arguments[0] as Key, arguments[1] as string, arguments[2] as number);
                }

            default:
                throw new Error("Invalid number of arguments");
        }
    }

    static deleteKey(path: string): void
    static deleteKey(key: Key, path: string): void
    static deleteKey(): void {
        switch (arguments.length) {
            case 2:
                {
                    let path = arguments[0] as string
                    path = path.replaceAll("/", "\\");
                    const hiveName = path.substring(0, path.indexOf("\\"));
                    path = path.substring(path.indexOf("\\") + 1);
                    switch (hiveName) {
                        case "HKCR":
                        case "HKEY_CLASSES_ROOT":
                            return deleteKey(this.HKCR, path);
                        case "HKCU":
                        case "HKEY_CURRENT_USER":
                            return deleteKey(this.HKCU, path);
                        case "HKLM":
                        case "HKEY_LOCAL_MACHINE":
                            return deleteKey(this.HKLM, path);
                        case "HKU":
                        case "HKEY_USERS":
                            return deleteKey(this.HKU, path);
                        case "HKPD":
                        case "HKEY_PERFORMANCE_DATA":
                            return deleteKey(this.HKPD, path);
                        case "HKCC":
                        case "HKEY_CURRENT_CONFIG":
                            return deleteKey(this.HKCC, path);
                        default:
                            throw new Error("Invalid hive name");
                    }
                }
                break;

            case 3:
                {
                    return deleteKey(arguments[0] as Key, arguments[1] as string);
                }

            default:
                throw new Error("Invalid number of arguments");
        }
    }
}

