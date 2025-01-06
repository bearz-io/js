import { dirname, fromFileUrl, join } from "@std/path";
import { walk } from "jsr:@std/fs@1.0.0";

const scope = Deno.args.length > 0 ? Deno.args[0] : "@bearz";

const __dirname = dirname(fromFileUrl(import.meta.url));

const engDir = dirname(__dirname);
const rootDir = dirname(engDir);
const libDir = join(rootDir, scope);
console.log(libDir);

async function isFile(path: string): Promise<boolean> {
    try {
        return (await Deno.stat(path)).isFile;
    } catch {
        return false;
    }
}

for await (const entry of walk(libDir)) {
    if (entry.isDirectory) {
        const readme = join(entry.path, "README.md");
        let mod = join(entry.path, "mod.ts");

        let modExists = await isFile(mod);
        if (!modExists) {
            mod = join(entry.path, "src", "mod.ts");
            modExists = await isFile(mod);
        }

        if (await isFile(mod) && await isFile(readme)) {
            let readmeContent = await Deno.readTextFile(readme);
            const modContent = await Deno.readTextFile(mod);

            const overviewIndex = readmeContent.indexOf("## Overview");
            const modCommentEndIndex = modContent.indexOf("*/");

            /*
             * If the readme contains *\/ we need to escape it
             */
            if (readmeContent.match(/\*\//gm)) {
                console.log("Found */ in readme");
                readmeContent = readmeContent.replaceAll(/\*\//gm, "*\\/");
                console.log(readmeContent);
            }

            if (readmeContent.indexOf("## Overview") > -1) {
                if (modCommentEndIndex > -1) {
                    const modContentWithoutComment = modContent.slice(modCommentEndIndex + 2);
                    const newModContent = `/**
 * ${readmeContent.slice(overviewIndex).replaceAll("\n", "\n * ")}
 * @module
 */`;

                    await Deno.writeTextFile(mod, newModContent + modContentWithoutComment);
                } else {
                    const newModContent = `/**
 * ${readmeContent.slice(overviewIndex).replaceAll("\n", "\n * ")}
 * @module
 */
${modContent}`;
                    await Deno.writeTextFile(mod, newModContent);
                }
            }
        }
    }
}
