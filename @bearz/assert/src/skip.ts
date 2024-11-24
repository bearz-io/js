// deno-lint-ignore no-explicit-any
const g = globalThis as any;

interface SkipResult extends Record<string, unknown> {
}

let skip = function (skip: boolean): SkipResult {
    return { skip };
};

if (g.Deno) {
    skip = function (skip: boolean): SkipResult {
        return { ignore: skip };
    };
}

export { skip };
