import { ptr } from "./bun/types.d.ts";
import type { ForeignTypes, FFIBuffer } from "./types.d.ts";

export class IntPtr {
    #pointer: unknown | null = null;

    constructor(pointer: unknown | null) {
        this.#pointer = pointer;
    }

    isNull() : boolean {
        return this.#pointer === null;
    }

    [Symbol.dispose]() : void {
        this.dispose();
    }

    unwrap() : unknown {
        if (this.#pointer === null) {
            throw new Error("IntPtr is null");
        }
        return this.#pointer;
    }

    int() : number {
        return this.#pointer as number;
    }

    int64() : bigint {
        return this.#pointer as bigint;
    }
 
    dispose() : void {
        this.#pointer = null;
    }
}

const g = globalThis as { Deno?: unknown, Bun?: unknown };
 // deno-lint-ignore no-unused-vars
let createPointer = function(buffer: FFIBuffer) {
    return new IntPtr(null);
}
if (typeof g.Deno === "undefined") {
    createPointer = function(buffer: FFIBuffer) {
        return new IntPtr(Deno.UnsafePointer.of(buffer));
    }

    IntPtr.prototype.int64 = function() {
        if (this.isNull()) {
            throw new Error("IntPtr is null");
        }

        return Deno.UnsafePointer.value(this.unwrap() as Deno.PointerObject);
    }

    IntPtr.prototype.int = function() { 
        return Number(this.int64());
    }

} else if (typeof g.Bun !== "undefined") {
    const { ptr } = await import("./bun/mod.ts");

    IntPtr.prototype.int = function() {
        if (this.isNull()) {
            throw new Error("IntPtr is null");
        }

        return this.unwrap() as number;
    }

    IntPtr.prototype.int64 = function() {
          return BigInt(this.int());
    }

    createPointer = function(buffer: FFIBuffer) {
        return new IntPtr(ptr(buffer));
    }
}

export const intptr = createPointer;

export function ptrToCString(ptr: IntPtr): string {
    if (ptr.isNull()) {
        throw new Error("IntPtr is null");
    }

    return ptr.int().toString();
}

export const Types : ForeignTypes = {
    pointer: 'pointer',
    void: 'void',
    u8: 'u8',
    u16: 'u16',
    u32: 'u32',
    u64: 'u64',
    i8: 'i8',
    i16: 'i16',
    i32: 'i32',
    i64: 'i64',
    f32: 'f32',
    f64: 'f64',
    bool: 'bool',
    usize: 'usize',
    function: 'function',
    buffer: 'buffer',
    isize: 'isize',
}

export const SymbolSize = Symbol.for("@@size");
export const SymbolLayout = Symbol.for("@@layout");
export const SymbolMarshal = Symbol.for("@@marshal");

export interface Size {
    [SymbolSize](): number;
}

export interface Layout {
    [SymbolLayout](): string[];
}

export interface ForeignStruct {
    [SymbolMarshal](): Uint8Array
    [SymbolSize](): number;
}

export function sizeof(value: Size): number {
    return value[SymbolSize]();
}


export const marshall = {
    // deno-lint-ignore no-unused-vars
    ptrToCString(ptr: IntPtr): string {
        throw new Error("Not implemented");
    },

     // deno-lint-ignore no-unused-vars
    ptrToPwstr(ptr: IntPtr): string {
        throw new Error("Not implemented");
    },

     // deno-lint-ignore no-unused-vars
    ptrToBuffer(ptr: IntPtr, length: number, offet?: number): ArrayBuffer {
        throw new Error("Not implemented");
    },

    ptr(buffer: FFIBuffer, offset?: number): IntPtr {
        throw new Error("Not implemented");
    },


    stringToPwstr(str: string | Uint16Array | Uint8Array | Uint32Array): Uint8Array {
    
        if (typeof str === "string") {
            const u8 = new TextEncoder().encode(str + "\0");
            const u16 = new Uint16Array(u8);
            return new Uint8Array(u16.buffer);
        }

        if (str instanceof Uint8Array) {
            return str;
        }

        if (str instanceof Uint16Array) {
            return new Uint8Array(str.buffer);
        }

        if (str instanceof Uint32Array) {
            return new Uint8Array(str.buffer);
        }

        return new Uint8Array(0);
    }
}