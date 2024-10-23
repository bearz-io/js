import { WINDOWS } from "@bearz/runtime-info/os";
import { type CharBuffer, toCharSliceLike } from "./utils.ts";
import { toCharArray } from "./utils.ts";
import { sprintf } from "@bearz/fmt/printf";

/**
 * Represents a mutable string of characters that are stored
 * as code points in a Uint32Array.
 */
export class CharArrayBuilder {
    #buffer: Uint32Array;
    #length: number;

    /**
     * Creates a new instance of the StringBuilder class.
     * @param capacity The initial capacity of the char builder. Default is 16.
     */
    constructor(capacity = 16) {
        this.#length = 0;
        this.#buffer = new Uint32Array(capacity);
    }

    /**
     * Gets the length of the char or string builder.
     */
    get length(): number {
        return this.#length;
    }

    /**
     * Appends a formatted string to the string builder.
     * @param template The template string to append.
     * @param args The arguments to format the template with.
     * @returns The updated `StringBuilder` or `CharArrayBuilder` instance.
     */
    appendFormat(template: string, ...args: unknown[]): this {
        this.appendString(sprintf(template, ...args));
        return this;
    }

    /**
     * Appends a value to the string builder.
     * @param value The value to append to the string builder.
     * @returns The updated `StringBuilder` or `CharArrayBuilder` instance.
     */
    append(value: CharBuffer | number | Date | boolean | bigint): this {
        // deno-lint-ignore no-explicit-any
        const v = value as any;
        if (v.length !== undefined && v.at !== undefined) {
            this.appendSlice(v);
        } else {
            const type = typeof value;
            switch (type) {
                case "string":
                    this.appendString(v as string);
                    break;
                case "bigint":
                    this.appendString(v.toString());
                    break;
                case "number":
                    this.appendString(v.toString());
                    break;
                case "boolean":
                    this.appendString(v.toString());
                    break;
                case "object":
                    if (v instanceof Date) {
                        this.appendString(v.toString());
                    } else {
                        throw new RangeError("Argument 'value' is not a valid type.");
                    }
                    break;
                default:
                    throw new RangeError("Argument 'value' is not a valid type.");
            }
        }

        return this;
    }

    /**
     * Appends a Unicode character to the string builder.
     * @param value The Unicode character (codepoint) to append.
     * @returns The update `StringBuilder` or `CharArrayBuilder` instance.
     */
    appendChar(value: number): this {
        if (!Number.isInteger(value) || (value < 0 || value > 0x10FFFF)) {
            throw new Error("Argument 'value' must be a valid Unicode character.");
        }

        this.grow(this.#length + 1);
        this.#buffer[this.#length] = value;
        this.#length++;
        return this;
    }

    /**
     * Appends a char slice to the string builder.
     * @param value The slice to append.
     * @returns The updated string builder.
     */
    appendSlice(value: CharBuffer): this {
        this.grow(this.#length + value.length);
        const v = toCharSliceLike(value);

        const l = this.length;
        for (let i = 0; i < value.length; i++) {
            const rune = v.at(i) ?? 0;
            this.#buffer[l + i] = rune;
        }

        this.#length += value.length;
        return this;
    }

    /**
     * Appends a string to the end of the string builder.
     * @param value The string to append.
     * @returns The updated `CharArrayBuilder` instance.
     */
    appendString(value: string) {
        this.appendCharArray(toCharArray(value));
    }

    /**
     * Appends a character array to the end of the string builder.
     * @param value The character array to append.
     * @returns The updated `CharArrayBuilder` instance.
     */
    appendCharArray(value: Uint32Array) {
        this.grow(this.#length + value.length);
        this.#buffer.set(value, this.#length);
        this.#length += value.length;
    }

    /**
     * Appends a string followed by a line break to the string builder.
     * @param value The string to append.
     * @returns The updated string builder.
     */
    appendLine(value?: CharBuffer): this {
        if (value !== undefined && value.length > 0) {
            this.appendSlice(value);
        }

        if (WINDOWS) {
            this.appendChar(13);
        }
        this.appendChar(10);

        return this;
    }

    /**
     * Shrinks the capacity of the string builder to the specified value.
     * @param capacity The new capacity of the string builder.
     * @returns The updated StringBuilder instance.
     * @throws ArgumentRangeError if the capacity is less than 0.
     */
    shrinkTo(capacity: number): this {
        if (capacity < 0) {
            throw new RangeError(
                "Argument 'capacity' must be greater than -1.",
            );
        }

        this.#buffer = this.#buffer.slice(0, capacity);
        return this;
    }

    /**
     * Clears the string builder.
     * @returns The updated `CharArrayBuilder` instance.
     */
    clear(): this {
        this.#length = 0;
        this.#buffer.fill(0);
        return this;
    }

    /**
     * Trims excess capacity from the string builder.
     * @returns The updated StringBuilder instance.
     */
    trimExcess(): this {
        this.shrinkTo(this.#length);
        return this;
    }

    /**
     * Converts the string builder to an array of characters.
     * @returns The array of characters.
     */
    toArray(): Uint32Array {
        const buffer = new Uint32Array(this.#length);
        buffer.set(this.#buffer.slice(0, this.#length));
        return buffer;
    }

    /**
     * Converts the string builder to a string.
     * @returns The string representation of the string builder.
     */
    toString(): string {
        return String.fromCodePoint(...this.#buffer.slice(0, this.#length));
    }

    /**
     * Increases the capacity of the string builder, if necessary, to accommodate the specified capacity.
     * @param capacity The minimum capacity to ensure.
     * @private
     */
    private grow(capacity: number): this {
        if (capacity <= this.#buffer.length) {
            return this;
        }

        capacity = Math.max(capacity, this.#buffer.length * 2);
        const newBuffer = new Uint32Array(capacity);
        newBuffer.set(this.#buffer);
        this.#buffer = newBuffer;
        return this;
    }
}
