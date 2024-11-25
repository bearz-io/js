import { Command } from "@cliffy/command";
import { dirname, fromFileUrl, join } from "@std/path";
import { Twig } from "./twig.ts";
import { ensureDir, exists } from "@bearz/fs";

const app = new Command();

app.name("create-mod")
    .arguments("<name:string>")
    .option("--description <description:string>", "Description of the module")
    .option("-d --dest <dest:string>", "Destination directory")
    .action(async ({ description, dest }, name) => {
        const dir = dirname(fromFileUrl(import.meta.url));
        const eng = dirname(dir);

        description ??= `${name} module`;
        dest ??= Deno.cwd();
        let scope = "@tasks";
        if (name.startsWith("@") && name.includes("/")) {
            const parts = name.split("/");
            scope = parts[0];
            name = parts[1];
        }

        const data = {
            "name": `@${scope}/${name}`,
            "description": description,
            "version": "0.0.0",
            "exports": {
                ".": "./mod.ts",
            },
        };

        const lib = join(dest, scope, name);
        await ensureDir(lib);

        await Deno.writeTextFile(join(lib, "deno.json"), JSON.stringify(data, null, 4));

        const readmeTplPath = join(eng, "tpl", "README.md.twig");
        const readmeTpl = await Deno.readTextFile(readmeTplPath);

        const readme = Twig.twig({ data: readmeTpl }).render({ name, scope, description });
        await Deno.writeTextFile(join(lib, "README.md"), readme);
        await Deno.writeTextFile(join(lib, "mod.ts"), `// TODO: Write module code here`);

        const licenseTpl = join(eng, "tpl", "LICENSE.md");
        await Deno.copyFile(licenseTpl, join(lib, "LICENSE.md"));

        let parentDir = dirname(lib);
        while (parentDir.length > 0 && parentDir.length > 3) {
            console.log(parentDir);
            const configFile = join(parentDir, "deno.json");
            if (await exists(configFile)) {
                const json = JSON.parse(await Deno.readTextFile(configFile));
                json.workspace ??= [];
                if (!json.workspace.includes(`${scope}/${name}`)) {
                    json.workspace.push(`${scope}/${name}`);
                }
                await Deno.writeTextFile(configFile, JSON.stringify(json, null, 4));
                break;
            }
            parentDir = dirname(parentDir);
        }
    });

app.parse(Deno.args);
