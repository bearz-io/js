// deno-lint-ignore no-explicit-any
const g = globalThis as any;

// deno-lint-ignore no-explicit-any
interface SkipResult extends Record<string, any> {
}

export interface SkipOptions {
    skip?: boolean;
    integration?: boolean;
    windows?: boolean;
    linux?: boolean;
    darwin?: boolean;
}

function skip(options: SkipOptions): SkipResult;
function skip(skip: boolean): SkipResult;
function skip(): SkipResult {
    const arg = arguments[0];
    if (typeof arg === "boolean") {
        if (g.Deno) {
            return { ignore: arg };
        } else {
            return { skip: arg };
        }
    }

    if (skip === undefined && typeof arg === "object") {
        if (g.Deno) {
            if (arg.windows && Deno.build.os !== "windows") {
                return { ignore: true };
            }

            if (arg.linux && Deno.build.os !== "linux") {
                return { ignore: true };
            }

            if (arg.darwin && Deno.build.os !== "darwin") {
                return { ignore: true };
            }

            if (arg.integration && !g.BEARZ_INTEGRATION_TESTS) {
                return { ignore: true };
            }

            if (arg.skip) {
                return { ignore: true };
            }
        } else {
            if (arg.skip) {
                return { skip: true };
            }

            if (arg.integration && !g.BEARZ_INTEGRATION_TESTS) {
                return { skip: true };
            }

            if (g.procces) {
                const process = g.process as Record<string, unknown>;

                if (arg.windows && process.platform !== "windows") {
                    return { skip: true };
                }

                if (arg.linux && process.platform !== "linux") {
                    return { skip: true };
                }

                if (arg.darwin && process.platform !== "darwin") {
                    return { skip: true };
                }
            }
        }
    }

    if (g.Deno) {
        return { ignore: false };
    } else {
        return { skip: false };
    }
}

export { skip };
