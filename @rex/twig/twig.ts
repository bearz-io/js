import { TwingEnvironment, TwingFunction, TwingLexer, TwingLoaderArray } from "npm:twing@5.2.2";
import { readTextFile } from "@bearz/fs";
import { DefaultSecretGenerator } from "@bearz/secrets/generator";

export interface TwigParams {
    expr?: boolean;
}

const newSecret = new TwingFunction(
    "newSecret",
    (size: number = 16, upper = true, lower = true, digits = true, special = "_-#@{}^~:|") => {
        return new Promise((resolve) => {
            const sg = new DefaultSecretGenerator();
            if (upper) {
                sg.add("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
            }

            if (lower) {
                sg.add("abcdefghijklmnopqrstuvwxyz");
            }

            if (digits) {
                sg.add("0123456789");
            }

            sg.add(special);

            resolve(sg.generate(size));
        });
    },
    [{
        name: "size",
        defaultValue: 16,
    }, {
        name: "upper",
        defaultValue: true,
    }, {
        name: "lower",
        defaultValue: true,
    }, {
        name: "digits",
        defaultValue: true,
    }, {
        name: "special",
        defaultValue: "_-#@{}^~:|",
    }],
    {},
);

export class Twig {
    #env: TwingEnvironment;
    #loader: TwingLoaderArray;

    constructor(params?: TwigParams) {
        this.#loader = new TwingLoaderArray({});
        this.#env = new TwingEnvironment(this.#loader);

        if (params?.expr) {
            const lexer = new TwingLexer(this.#env, {
                "comment_pair": ["${#", "#}"],
                "variable_pair": ["${{", "}}"],
                "tag_pair": ["${%", "%}"],
            });

            this.#env.setLexer(lexer);
        }

        this.#env.addFunction(newSecret);
    }

    async render(template: string, context: Record<string, unknown>): Promise<string> {
        this.#loader.setTemplate("default", template);
        return await this.#env.render("default", context);
    }

    async renderFile(path: string, context: Record<string, unknown>): Promise<string> {
        const tpl = await readTextFile(path);
        this.#loader.setTemplate("file", tpl);
        return await this.#env.render("file", context);
    }
}

export const twig: Twig = new Twig();
