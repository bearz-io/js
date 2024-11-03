interface Token extends Record<string, string> {
    kind: "comment" | "newline" | "item";
}

interface CommentToken extends Token {
    kind: "comment";
    value: string;
}

interface NewlineToken extends Token {
    kind: "newline";
}

interface ItemToken extends Token {
    kind: "item";
    key: string;
    value: string;
}

export class DotEnvDocument implements Iterable<Token> {
    #tokens: Token[] = [];

    constructor() {
        this.#tokens = [];
    }

    get length(): number {
        return this.#tokens.length;
    }

    at(index: number): Token {
        return this.#tokens[index];
    }

    token(token: Token): this {
        this.#tokens.push(token);
        return this;
    }

    comment(value: string): this {
        this.token({ kind: "comment", value });
        return this;
    }

    newline(): this {
        this.token({ kind: "newline" });
        return this;
    }

    item(key: string, value: string): this {
        this.token({ kind: "item", key, value });
        return this;
    }

    [Symbol.iterator](): Iterator<Token> {
        return this.#tokens[Symbol.iterator]();
    }

    toArray(): Token[] {
        return this.#tokens.slice();
    }

    toObject(): Record<string, string> {
        const obj: Record<string, string> = {};
        for (const token of this) {
            if (token.kind === "item") {
                const pair = token as ItemToken;
                obj[pair.key] = pair.value;
            }
        }
        return obj;
    }
}
