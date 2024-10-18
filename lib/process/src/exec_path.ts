let execPathValue = "";

const g = globalThis as Record<string, unknown>;
if (g.Deno) {
    try {
        execPathValue = Deno.execPath();
    } catch {
        execPathValue = "";
    }
} else if (g.process) {
    const process = g.process as NodeJS.Process;
    execPathValue = process.execPath;
}

export const execPath = execPathValue;
