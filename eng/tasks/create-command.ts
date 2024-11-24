import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";
import { fromFileUrl, join } from "jsr:@std/path";
import { Twig } from "@bearz/twig";
import { dirname, isAbsolute, resolve } from "@std/path";
import { underscore } from "@bearz/strings/underscore";

const app = new Command();

app.name("create-command")
    .arguments("<name:string>")
    .option("-d --dest <dest:string>", "The destination directory")
    .action(async ({ dest }, name) => {
        const dir = dirname(fromFileUrl(import.meta.url));
        dest ??= Deno.cwd();
        const tplFile = join(dir, "tpl", "command.ts.twig");
        const tpl = await Deno.readTextFile(tplFile);
        if (!isAbsolute(dest)) {
            dest = resolve(Deno.cwd(), dest);
        }

        const content = Twig.twig({ data: tpl }).render({ name });
        await Deno.writeTextFile(join(dest, `${underscore(name)}.ts`), content);
    });

app.parse(Deno.args);
