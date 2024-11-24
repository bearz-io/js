export * from "./command_abstractions.ts";

const g = globalThis as unknown as { Deno?: unknown; process?: unknown; BEARZ_USE_NODE?: boolean };

if (g.Deno && !g.BEARZ_USE_NODE) {
    const _ = await import("./deno/load.ts");
} else if (g.Deno) {
    const _ = await import("./node/load.ts");
}
