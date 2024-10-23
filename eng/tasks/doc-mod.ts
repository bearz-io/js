import { dirname, fromFileUrl, join } from "@std/path";
import { isFile, walk } from "jsr:@gnome/fs@0.3.0";

const __dirname = dirname(fromFileUrl(import.meta.url));

const engDir = dirname(__dirname);
const rootDir = dirname(engDir);
const libDir = join(rootDir, "lib");
console.log(libDir);

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
            const readmeContent = await Deno.readTextFile(readme);
            const modContent = await Deno.readTextFile(mod);

            const overviewIndex = readmeContent.indexOf("## Overview");
            const modCommentEndIndex = modContent.indexOf("*/");
            if (readmeContent.indexOf("## Overview") > -1) {
                if (modCommentEndIndex > -1) {
                    const modContentWithoutComment = modContent.slice(modCommentEndIndex + 2);
                    const newModContent = `/**
 * ${readmeContent.slice(overviewIndex).replaceAll("\n", "\n * ")}
 */`;

                    await Deno.writeTextFile(mod, newModContent + modContentWithoutComment);
                } else {
                    const newModContent = `/**
 * ${readmeContent.slice(overviewIndex).replaceAll("\n", "\n * ")}
 */
${modContent}`;
                    await Deno.writeTextFile(mod, newModContent);
                }
            }
        }
    }
}
