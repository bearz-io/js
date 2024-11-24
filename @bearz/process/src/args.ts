let args: ReadonlyArray<string> = [];

const g = globalThis as Record<string, unknown>;
if (g.Deno) {
    args = Deno.args;
} else if (g.process) {
    const process = g.process as NodeJS.Process;
    args = process.argv.concat([]);
}

export { args };
