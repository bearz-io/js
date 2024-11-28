// deno-lint-ignore no-explicit-any
const g = globalThis as any;

export function $integration(): boolean {
    return g.BEARZ_INTEGRATION_TESTS as boolean;
}
