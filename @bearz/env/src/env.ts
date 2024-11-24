import { Env } from "./env_abstractions.ts";

const g = globalThis as { Deno?: unknown; process?: unknown; BEARZ_USE_NODE?: boolean };

if (g.Deno && !g.BEARZ_USE_NODE) {
    await import("./deno/load.ts");
} else if (g.process) {
    await import("./node/load.ts");
}
/**
 * The environment object which represents the environment variables
 * for the current process.
 */
const env: Env = new Env();

export { Env, env };
