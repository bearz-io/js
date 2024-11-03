/**
 * Represents a token in a document for environment variables.
 */
interface Token extends Record<string, string> {
    kind: "comment" | "newline" | "item";
}

/**
 * Represents a comment token in a document for environment variables.
 */
interface CommentToken extends Token {
    kind: "comment";
    value: string;
}

/**
 * Represents a newline token in a document for environment variables.
 */
interface NewlineToken extends Token {
    kind: "newline";
}

/**
 * Represents an item token in a document for environment variables.
 */
interface ItemToken extends Token {
    kind: "item";
    key: string;
    value: string;
}

/**
 * Represents a document for environment variables, providing methods to manipulate and iterate over tokens.
 * Implements the Iterable interface for Token objects.
 */
export class DotEnvDocument implements Iterable<Token> {
    /**
     * Array to store tokens.
     */
    #tokens: Token[] = [];

    /**
     * Initializes a new instance of the DotEnvDocument class.
     */
    constructor() {
        this.#tokens = [];
    }

    /**
     * Gets the number of tokens in the document.
     * @returns The number of tokens.
     */
    get length(): number {
        return this.#tokens.length;
    }

    /**
     * Retrieves the token at the specified index.
     * @param index - The index of the token to retrieve.
     * @returns The token at the specified index.
     */
    at(index: number): Token {
        return this.#tokens[index];
    }

    /**
     * Adds a token to the document.
     * @param token - The token to add.
     * @returns The current instance of DotEnvDocument.
     */
    token(token: Token): this {
        this.#tokens.push(token);
        return this;
    }

    /**
     * Adds a comment token to the document.
     * @param value - The comment text.
     * @returns The current instance of DotEnvDocument.
     */
    comment(value: string): this {
        this.token({ kind: "comment", value });
        return this;
    }

    /**
     * Adds a newline token to the document.
     * @returns The current instance of DotEnvDocument.
     */
    newline(): this {
        this.token({ kind: "newline" });
        return this;
    }

    /**
     * Adds an item token to the document.
     * @param key - The key of the item.
     * @param value - The value of the item.
     * @returns The current instance of DotEnvDocument.
     */
    item(key: string, value: string): this {
        this.token({ kind: "item", key, value });
        return this;
    }

    /**
     * Returns an iterator for the tokens in the document.
     * @returns An iterator for the tokens.
     */
    [Symbol.iterator](): Iterator<Token> {
        return this.#tokens[Symbol.iterator]();
    }

    /**
     * Converts the tokens to an array.
     * @returns An array of tokens.
     */
    toArray(): Token[] {
        return this.#tokens.slice();
    }

    /**
     * Converts the tokens to an object where item tokens are represented as key-value pairs.
     * @returns An object representation of the item tokens.
     */
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
