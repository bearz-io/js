
const g = globalThis as Record<string, unknown>;

let debug = false;

if (g.DEBUG) {
    debug = true;
}

if (g.process) {
    const process = g.process as  { env: Record<string, string> };
    if (process.env['DEBUG']) {
        debug = true;
    }
}

export function setDebug(value: boolean): void {    
    debug = value;
}

export function isDebug(): boolean {
    return debug;
}

