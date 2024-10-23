import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";
import { join } from "jsr:@std/path";
// @ts-types="npm:@types/twig"
import Twig from "npm:twig";
import { engDir, projectRoot } from "./paths.ts";

const app = new Command();

app.name("create-mod")
    .arguments("<name:string>")
    .option("--description <description:string>", "Description of the module")
    .action(async ({ description }, name) => {
        description ??= `${name} module`;
        const data = {
            "name": `@bearz/${name}`,
            "description": description,
            "version": "0.0.0",
            "exports": {
                ".": "./src/mod.ts",
            },
        };

        const dir = join(projectRoot, "lib", name);
        await Deno.mkdir(dir);
        await Deno.mkdir(join(dir, "src"));
        await Deno.writeTextFile(join(dir, "deno.json"), JSON.stringify(data, null, 4));

        const readmeTplPath = join(engDir, "tpl", "README.md.twig");
        const readmeTpl = await Deno.readTextFile(readmeTplPath);

        const readme = Twig.twig({ data: readmeTpl }).render({ name, description });
        await Deno.writeTextFile(join(dir, "README.md"), readme);
        await Deno.writeTextFile(join(dir, "src", "mod.ts"), `// TODO: Write module code here`);

        const licenseTpl = join(engDir, "tpl", "LICENSE.md");
        await Deno.copyFile(licenseTpl, join(dir, "LICENSE.md"));
    });

app.parse(Deno.args);
