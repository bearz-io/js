import { TwingEnvironment, TwingLexer, TwingLoaderArray } from "npm:twing@5.2.2";
import {} from "@rex/docker";
const loader = new TwingLoaderArray({});

const twing = new TwingEnvironment(loader);

const lexer = new TwingLexer(twing, {
    "comment_pair": ["${#", "#}"],
    "variable_pair": ["${{", "}}"],
    "tag_pair": ["${%", "%}"],
});

twing.setLexer(lexer);

// deno-lint-ignore no-explicit-any
export async function render(template: string, context: any): Promise<string> {
    loader.setTemplate("default", template);

    return await twing.render("default", context);
}
