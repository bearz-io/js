const g = globalThis as Record<string, unknown>;

if (g.Deno) {
    /**
     * Whether to use the node runtime or the deno runtime.
     *
     * This is primarily used for testing.
     */
    g.BEARZ_USE_NODE = Deno.env.get("BEARZ_USE_NODE") === "true";

    g.BEARZ_INTEGRATION_TESTS = Deno.env.get("BEARZ_INTEGRATION_TESTS") === "true";
} else if (g.process) {
    g.BEARZ_USE_NODE = true;
    const process = g.process as Record<string, unknown>;
    const env = process.env as Record<string, string>;

    g.BEARZ_INTEGRATION_TESTS = env.BEARZ_INTEGRATION_TESTS === "true";
}
