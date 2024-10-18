import { Command } from "jsr:@cliffy/command@1.0.0-rc.7"
import { join } from "jsr:@std/path";
// @ts-types="npm:@types/twig"
import Twig from "npm:twig";
import { engDir, projectRoot } from "./paths.ts";

// @ts-types="npm:@types/yaml"
import { parse } from "npm:yaml";

const app = new Command()

app.name("create-mod")
    .arguments("<name:string>")
    .action(async (_, name) => {
        const jsr = join(projectRoot, "jsr", name);
        const denoConfPath = join(jsr, "deno.json");
        const 


        const pkg = {
            "name": `@bearz/${name}`,
        }


    });

await app.parse(Deno.args);