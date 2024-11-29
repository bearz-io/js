import { dirname, fromFileUrl, join, resolve } from "@std/path";
import { makeDir, remove, writeTextFile } from "@bearz/fs";

export function resolveRelativePath(metaUrl: URL | string, relativePath: string) {
    const dir = dirname(fromFileUrl(metaUrl));
    return resolve(join(dir, relativePath));
}

export async function runTest(
    url: string | URL,
    relativePath: string,
    fn: (p: string) => void | Promise<void>,
) {
    const dir = resolveRelativePath(url, relativePath);
    await setup(dir);
    try {
        const r = fn(dir);
        if (r instanceof Promise) {
            await r;
        }
    } finally {
        await destroy(dir);
    }
}

export async function setup(folder: string) {
    const pkg = {
        name: "@yolo/pack",
        version: "0.0.0",
        private: true,
        license: "ISC",
        scripts: {
            "test": "echo 'test executed'",
            "build": "echo 'build executed'",
            "lint": "echo 'lint executed'",
            "echo": "echo",
        },
        dependencies: {
            "jsr": "^0.12.4",
        },
    };

    const json = JSON.stringify(pkg, undefined, 4);
    await makeDir(folder, { recursive: true });
    await writeTextFile(`${folder}/package.json`, json);
}

export async function destroy(folder: string) {
    await remove(folder, { recursive: true });
}
