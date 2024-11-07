// Registry key security and access rights.
// See https://msdn.microsoft.com/en-us/library/windows/desktop/ms724878.aspx
// for details.
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

export enum Hive {
    ClassesRoot = 0x80000000,
    CurrentUser = 0x80000001,
    LocalMachine = 0x80000002,
    Users = 0x80000003,
    PerformanceData = 0x80000004,
    CurrentConfig = 0x80000005,
}

export type TypedArrays =
    | Uint8Array
    | Uint16Array
    | Uint32Array
    | BigUint64Array
    | Float32Array
    | Float64Array
    | Int16Array
    | Int32Array
    | Int8Array
    | Uint8ClampedArray
    | Uint16Array
    | Uint32Array
    | BigInt64Array
    | BigUint64Array;

export class Handle {
    #handle: unknown | null = null;
    #buffer?: TypedArrays;

    constructor(pointer: unknown | null, buffer?: TypedArrays) {
        this.#handle = pointer;
        this.#buffer = buffer;
    }

    static from(buffer: TypedArrays): Handle {
        return new Handle(buffer, buffer);
    }

    isNull(): boolean {
        return this.#handle === null;
    }

    [Symbol.dispose](): void {
        this.dispose();
    }

    unwrap(): unknown {
        if (this.#handle === null) {
            throw new Error("Handle is null");
        }
        return this.#handle;
    }

    int(): number {
        return this.#handle as number;
    }

    int64(): bigint {
        return this.#handle as bigint;
    }

    dispose(): void {
        this.#handle = null;
    }
}
