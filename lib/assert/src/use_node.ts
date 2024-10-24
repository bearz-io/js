const g = globalThis as Record<string, unknown>;

if (g.Deno) {
    /**
     * Whether to use the node runtime or the deno runtime.
     * 
     * This is primarily used for testing.
     */
    g.BEARZ_USE_NODE = Deno.env.get("BEARZ_USE_NODE") === "true";
}