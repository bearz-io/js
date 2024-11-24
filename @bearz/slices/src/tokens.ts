import { toCharArray } from "./utils.ts";
import { equalFold } from "./equal.ts";

export class Tokens implements Iterable<Uint32Array> {
    #set: Array<Uint32Array>;

    constructor() {
        this.#set = new Array<Uint32Array>();
    }

    [Symbol.iterator](): Iterator<Uint32Array> {
        return this.#set[Symbol.iterator]();
    }

    get length(): number {
        return this.#set.length;
    }

    addString(word: string): this {
        this.add(toCharArray(word));
        return this;
    }

    indexOf(word: Uint32Array): number {
        for (let i = 0; i < this.#set.length; i++) {
            if (equalFold(word, this.#set[i])) {
                return i;
            }
        }

        return -1;
    }

    add(word: Uint32Array): this {
        if (this.indexOf(word) === -1) {
            this.#set.push(word);
        }

        return this;
    }
}
