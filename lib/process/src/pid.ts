let pid: number = 0;

const g = globalThis as Record<string, unknown>;
if (g.Deno) {
    pid = Deno.pid;
} else if (g.process) {
    // @ts-types="npm:@types/node"
    const process = g.process as NodeJS.Process;
    pid = process.pid;
}

export { pid };
