export class Lazy<T> {
    #value: T | undefined;
    #fn: () => T;

    constructor(fn: () => T) {
        this.#fn = fn;
    }

    get hasValue(): boolean {
        return this.#value != undefined;
    }

    get value(): T {
        if (this.#value == undefined) {
            this.#value = this.#fn();
        }
        return this.#value;
    }
}
