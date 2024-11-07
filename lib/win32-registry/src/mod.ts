import { Registry, type Key, type KeyInfo, Rights, HKEY_CLASSES_ROOT, HKEY_CURRENT_CONFIG, HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE,HKEY_PERFORMANCE_DATA,HKEY_USERS, Types  } from "./registry.ts";

const g = globalThis as { Deno?: unknown; };

if (g.Deno) {
    await import("./deno/load.ts")
}


export {
    Registry,
    Rights,
    Types,
    HKEY_CLASSES_ROOT,
    HKEY_CURRENT_CONFIG,
    HKEY_CURRENT_USER,
    HKEY_LOCAL_MACHINE,
    HKEY_PERFORMANCE_DATA,
    HKEY_USERS,
}

export type {
    Key,
    KeyInfo,
}