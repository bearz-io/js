import { dirname, fromFileUrl, join } from "@std/path";

const root = dirname(dirname(dirname(fromFileUrl(import.meta.url))));

const skip = JSON.parse(await Deno.readTextFile(`${root}/skip-publish.json`)) as string[];
// deno-lint-ignore no-explicit-any
const config = JSON.parse(await Deno.readTextFile(`${root}/deno.json`)) as Record<string, any>;
const dest = join(root, "deno-publish.json");

const workspace = config.workspace ?? [];

for (const name of skip) {
    const idx = workspace.indexOf(name);
    if (idx !== -1) {
        workspace.splice(idx, 1);
    }
}

config.workspace = workspace;
await Deno.writeTextFile(dest, JSON.stringify(config, null, 4));
