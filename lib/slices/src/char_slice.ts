import { isSpace, toLower, toUpper } from "@bearz/chars";
import { equal, equalFold } from "./equal.ts";
import {
    type CharBuffer,
    type CharSequence,
    type CharSliceLike,
    toCharSliceLike,
} from "./utils.ts";
import { endsWith, endsWithFold } from "./ends_with.ts";
import { startsWith, startsWithFold } from "./starts_with.ts";
import { indexOf, indexOfFold } from "./index_of.ts";
import { lastIndexOf, lastIndexOfFold } from "./last_index_of.ts";

/**
 * A read-only slice of a character buffer.
 * The slice is a view of the buffer and the buffer is not copied.
 *
 * This is a specialized slice type for working with string characters in their
 * uint32 codepoint format and provide string like methods such as trim, indexof, toUpper,
 * toLower, includes, and more without the need to convert them back into strings to perform
 * those operations.
 *
 * @experimental
 * API is experimental and subject to change.
 */
export class ReadOnlyCharSlice implements CharSequence, Iterable<number> {
    #buffer: Uint32Array;
    #start: number;
    #end: number;

    /**
     * Creates a new instance of the ReadOnlyCharSlice class.
     * @param buffer The buffer to slice.
     * @param start The start index of the slice.
     * @param end The end index of the slice.
     */
    constructor(buffer: Uint32Array, start = 0, end?: number) {
        this.#buffer = buffer;
        this.#start = start;
        this.#end = end ?? buffer.length - start;
    }

    /**
     * Gets the length of the slice.
     */
    get length(): number {
        return this.#end;
    }

    /**
     * Gets a value indicating whether the slice is empty.
     */
    get isEmpty(): boolean {
        return this.length === 0;
    }

    /**
     * Creates a `ReadOnlyCharSlice` from a string.
     * @param s The string to convert to a `ReadOnlyCharSlice`.
     * @returns The `ReadOnlyCharSlice` representation of the string.
     */
    static fromString(s: string): ReadOnlyCharSlice {
        const buffer = new Uint32Array(s.length);
        for (let i = 0; i < s.length; i++) {
            buffer[i] = s.codePointAt(i) ?? 0;
        }
        return new ReadOnlyCharSlice(buffer);
    }

    [Symbol.iterator](): Iterator<number> {
        let index = 0;
        const set = this.#buffer;
        const offset = this.#start;
        const length = this.#end;
        return {
            next(): IteratorResult<number> {
                if (index < length) {
                    return { done: false, value: set[offset + index++] };
                }
                return { done: true, value: undefined };
            },
        };
    }

    /**
     * Gets the element at the specified index.
     * @param index The index of the element to get.
     * @returns The element at the specified index.
     * @throws RangeError if the index is less than 0 or
     * greater than or equal to the length of the slice.
     */
    at(index: number): number {
        if (index < 0 || index >= this.#end) {
            throw new RangeError("Argument 'index' must be greater than or equal to 0.");
        }
        return this.#buffer[this.#start + index];
    }

    /**
     * Iterates over the elements of the slice.
     * @param callback The callback function to call for each element.
     * @returns The updated ReadOnlyCharSlice.
     */
    forEach(callback: (value: number, index: number) => void): this {
        for (let i = 0; i < this.length; i++) {
            callback(this.#buffer[this.#start + i], i);
        }

        return this;
    }

    /**
     * @param callback Callback function to call for each element.
     * @returns
     */
    map(callback: (value: number, index: number) => number): ReadOnlyCharSlice {
        const buffer = new Uint32Array(this.length);
        for (let i = 0; i < this.length; i++) {
            buffer[i] = callback(this.#buffer[this.#start + i], i);
        }

        return new ReadOnlyCharSlice(buffer);
    }

    /**
     * Creates a new ReadOnlyCharSlice that is the result of capitalizing the
     * first character of each word in this ReadOnlyCharSlice.
     * @returns A new ReadOnlyCharSlice.
     */
    captialize(): ReadOnlyCharSlice {
        const buffer = new Uint32Array(this.length);
        buffer.set(this.#buffer, this.#start);
        buffer[0] = toUpper(buffer[0]);
        return new ReadOnlyCharSlice(buffer);
    }

    /**
     * Determines if the ReadOnlyCharSlice includes the given value.
     * @param value The value to check for.
     * @param index The index to start the search at.
     * @returns `true` if the ReadOnlyCharSlice includes the given value;
     * otherwise `false`.
     */
    includes(value: CharBuffer, index = 0): boolean {
        return this.indexOf(value, index) !== -1;
    }

    /**
     * Determines if the ReadOnlyCharSlice includes the given value using
     * a case-insensitive comparison.
     * @param value The value to check for.
     * @param index The index to start the search at.
     * @returns `true` if the ReadOnlyCharSlice includes the given value;
     * otherwise `false`.
     */
    includesFold(value: CharBuffer, index = 0): boolean {
        return this.indexOfFold(value, index) !== -1;
    }

    /**
     * Determines the index of the first occurrence of the given value
     * in the ReadOnlyCharSlice.
     *
     * @param value The value to search for.
     * @param index The index to start the search at.
     * @returns The index of the first occurrence of the given value in the ReadOnlyCharSlice,
     * or -1 if not found.
     */
    indexOf(value: CharBuffer | number, index = 0): number {
        if (typeof value === "number") {
            value = new Uint32Array([value]);
        }

        return indexOf(this, value, index);
    }

    /**
     * Determines the index of the first occurrence of the given value
     * in the ReadOnlyCharSlice using a case-insensitive comparison.
     *
     * @param value The value to search for.
     * @param index The index to start the search at.
     * @returns The index of the first occurrence of the given value in the ReadOnlyCharSlice,
     * or -1 if not found.
     */
    indexOfFold(value: CharBuffer | number, index = 0): number {
        if (typeof value === "number") {
            value = new Uint32Array([value]);
        }

        return indexOfFold(this, value, index);
    }

    /**
     * Determines if the the ReadOnlyCharSlice is equal to
     * the given CharBuffer.
     * @param other The other CharBuffer to compare.
     * @returns `true` if the two CharBuffers are equal; otherwise `false`.
     */
    equals(other: CharBuffer): boolean {
        if (this.length !== other.length) {
            return false;
        }

        return equal(this, other);
    }

    /**
     * Determines if the the ReadOnlyCharSlice is equal to
     * the given CharBuffer using a case-insensitive comparison.
     * @param other The other CharBuffer to compare.
     * @returns `true` if the two CharBuffers are equal; otherwise `false`.
     */
    equalsFold(other: CharBuffer): boolean {
        if (this.length !== other.length) {
            return false;
        }

        return equalFold(this, other);
    }

    /**
     * Determines if the ReadOnlyCharSlice ends with the given suffix.
     * @param suffix The suffix to check for.
     * @returns `true` if the ReadOnlyCharSlice ends with the given
     * suffix; otherwise `false`.
     */
    endsWith(suffix: CharBuffer): boolean {
        return endsWith(this, suffix);
    }

    /**
     * Determines if the ReadOnlyCharSlice ends with the given suffix
     * using a case-insensitive comparison.
     * @param suffix The suffix to check for.
     * @returns `true` if the ReadOnlyCharSlice ends with the given
     * suffix; otherwise `false`.
     */
    endsWithFold(suffix: CharBuffer): boolean {
        return endsWithFold(this, suffix);
    }

    /**
     * Creates a new ReadOnlyCharSlice that is a slice of the current ReadOnlyCharSlice,
     * which still a view of the same buffer.
     * @param start The start index of the slice.
     * @param end The end index of the slice.
     * @returns A new ReadOnlyCharSlice that is a slice of the current ReadOnlyCharSlice.
     * @throws RangeError if the start or end is less than 0 or
     * greater than or equal to the length of the slice.
     */
    slice(start = 0, end = this.length): ReadOnlyCharSlice {
        if (start < 0 || start >= this.length) {
            throw new RangeError("Argument 'start' must be greater than or equal to 0.");
        }

        if (end < 0 || end > this.length) {
            throw new RangeError("Argument 'end' must be greater than or equal to 0.");
        }

        return new ReadOnlyCharSlice(this.#buffer, this.#start + start, this.#start + end);
    }

    /**
     * Determines if the ReadOnlyCharSlice starts with the given prefix.
     * @param prefix The prefix to check for.
     * @returns `true` if the ReadOnlyCharSlice starts with the given
     * prefix; otherwise `false`.
     */
    startsWith(prefix: CharBuffer): boolean {
        return startsWith(this, prefix);
    }

    /**
     * Determines if the ReadOnlyCharSlice starts with the given prefix
     * using a case-insensitive comparison.
     * @param prefix The prefix to check for.
     * @returns `true` if the ReadOnlyCharSlice starts with the given
     * prefix; otherwise `false`.
     */
    startsWithFold(prefix: CharBuffer): boolean {
        return startsWithFold(this, prefix);
    }

    /**
     * Returns new `ReadOnlyCharSlice` that has lower characters.
     *
     * A new Uint32Array is allocated when using toLower because it is tranforming values
     * and needs a new container to store the results.
     *
     * @returns a new charslices with all lower characters.
     */
    get toLower(): ReadOnlyCharSlice {
        const buffer = new Uint32Array(this.length);

        let i = 0;
        for (let j = this.#start; j < this.#end; j++) {
            buffer[i++] = toLower(this.#buffer[j]);
        }

        return new ReadOnlyCharSlice(buffer);
    }

    /**
     * Returns new `ReadOnlyCharSlice` that has upper characters.
     *
     * A new Uint32Array is allocated when using toUpper because it is tranforming values
     * and needs a new container to store the results.
     *
     * @returns a new charslices with all upper characters.
     */
    get toUpper(): ReadOnlyCharSlice {
        const buffer = new Uint32Array(this.length);

        let i = 0;
        for (let j = this.#start; j < this.#end; j++) {
            buffer[i++] = toLower(this.#buffer[j]);
        }

        return new ReadOnlyCharSlice(buffer);
    }

    /**
     * Creates a new `ReadOnlyCharSlice` with the leading whitespace removed.
     *
     * @returns A new `ReadOnlyCharSlice` with the leading whitespace removed.
     */
    trimStartSpace(): ReadOnlyCharSlice {
        let start = this.#start;
        const end = this.#end;
        while (start < end && isSpace(this.#buffer[start])) {
            start++;
        }

        return new ReadOnlyCharSlice(this.#buffer, start, end);
    }

    /**
     * Creates a new `ReadOnlyCharSlice` with the leading character removed.
     *
     * @param c The character to remove.
     * @returns A new `ReadOnlyCharSlice` with the leading character removed.
     */
    trimStartChar(c: number): ReadOnlyCharSlice {
        let start = this.#start;
        const end = this.#end;
        while (start < end && this.#buffer[start] === c) {
            start++;
        }

        return new ReadOnlyCharSlice(this.#buffer, start, end);
    }

    /**
     * Creates a new `ReadOnlyCharSlice` with the leading characters removed.
     * @param t The character slice to remove.
     * @returns The new `ReadOnlyCharSlice` with the leading character removed.
     */
    trimStartSlice(t: CharSliceLike): ReadOnlyCharSlice {
        let start = this.#start;
        const end = this.#end;
        while (start < end) {
            let match = false;
            for (let i = 0; i < t.length; i++) {
                if (this.#buffer[start] === t.at(i)) {
                    start++;
                    match = true;
                    break;
                }
            }

            if (!match) {
                break;
            }
        }

        return new ReadOnlyCharSlice(this.#buffer, start, end);
    }

    /**
     * Creates a new `ReadOnlyCharSlice` with the leading characters removed.
     * @param t The character slice to remove.
     * @returns The new `ReadOnlyCharSlice` with the leading character removed.
     */
    trimStart(t?: CharSliceLike): ReadOnlyCharSlice {
        if (t === undefined) {
            return this.trimStartSpace();
        }

        if (t.length === 1) {
            return this.trimStartChar(t.at(0) ?? -1);
        }

        return this.trimStartSlice(t);
    }

    /**
     * Creates a new `ReadOnlyCharSlice` with the trailing whitespace removed.
     *
     * @returns A new `ReadOnlyCharSlice` with the trailing whitespace removed.
     */
    trimEndSpace(): ReadOnlyCharSlice {
        const start = this.#start;
        let end = this.#end;
        while (start < end && isSpace(this.#buffer[end - 1])) {
            end--;
        }

        return new ReadOnlyCharSlice(this.#buffer, start, end);
    }

    /**
     * Creates a new ReadOnlyCharSlice that is the result of trimming the
     * end of this ReadOnlyCharSlice.
     *
     * @param char A character to trim.
     * @returns A new ReadOnlyCharSlice.
     */
    trimEndChar(char: number): ReadOnlyCharSlice {
        const start = this.#start;
        let end = this.#end;
        while (start < end && this.#buffer[end - 1] === char) {
            end--;
        }

        return new ReadOnlyCharSlice(this.#buffer, start, end);
    }

    /**
     * Creates a new ReadOnlyCharSlice that is the result of trimming the
     * end of this ReadOnlyCharSlice.
     * @param slice
     * @returns A new ReadOnlyCharSlice.
     */
    trimEndSlice(slice: CharSliceLike): ReadOnlyCharSlice {
        const start = this.#start;
        let end = this.#end;
        while (start < end) {
            let match = false;
            for (let i = 0; i < slice.length; i++) {
                if (this.#buffer[end - 1] === slice.at(i)) {
                    end--;
                    match = true;
                    break;
                }
            }

            if (!match) {
                break;
            }
        }

        return new ReadOnlyCharSlice(this.#buffer, start, end);
    }

    /**
     * Creates a new ReadOnlyCharSlice that is the result of trimming the
     * end of this ReadOnlyCharSlice by a character or a slice of characters.
     * @param sliceLike
     * @returns A new ReadOnlyCharSlice.
     */
    trimEnd(sliceLike?: CharSliceLike): ReadOnlyCharSlice {
        if (sliceLike === undefined) {
            return this.trimEndSpace();
        }

        if (sliceLike.length === 1) {
            return this.trimEndChar(sliceLike.at(0) ?? -1);
        }

        return this.trimEndSlice(sliceLike);
    }

    /**
     * Creates a new ReadOnlyCharSlice that is the result of trimming the
     * start and end of this ReadOnlyCharSlice by spaces.
     * @returns A new ReadOnlyCharSlice.
     */
    trimSpace(): ReadOnlyCharSlice {
        let start = this.#start;
        let end = this.#end;
        while (start < end && isSpace(this.#buffer[start])) {
            start++;
        }

        while (start < end && isSpace(this.#buffer[end - 1])) {
            end--;
        }

        return new ReadOnlyCharSlice(this.#buffer, start, end);
    }

    /**
     * Creates a new ReadOnlyCharSlice that is the result of trimming the
     * start and end of this ReadOnlyCharSlice by a character.
     * @param char The character to trim.
     * @returns A new ReadOnlyCharSlice.
     */
    trimChar(char: number): ReadOnlyCharSlice {
        let start = this.#start;
        let end = this.#end;
        while (start < end && this.#buffer[start] === char) {
            start++;
        }

        while (start < end && this.#buffer[end - 1] === char) {
            end--;
        }

        return new ReadOnlyCharSlice(this.#buffer, start, end);
    }

    /**
     * Creates a new ReadOnlyCharSlice that is the result of trimming the
     * start and end of this ReadOnlyCharSlice by a slice of characters.
     *
     * @param slice The slice of characters to trim.
     * @returns A new ReadOnlyCharSlice.
     */
    trimSlice(slice: CharSliceLike): ReadOnlyCharSlice {
        let start = this.#start;
        let end = this.#end;
        while (start < end) {
            let match = false;
            for (let i = 0; i < slice.length; i++) {
                if (this.#buffer[start] === slice.at(i)) {
                    start++;
                    match = true;
                    break;
                }
            }

            if (!match) {
                break;
            }
        }

        while (start < end) {
            let match = false;
            for (let i = 0; i < slice.length; i++) {
                if (this.#buffer[end - 1] === slice.at(i)) {
                    end--;
                    match = true;
                    break;
                }
            }

            if (!match) {
                break;
            }
        }

        return new ReadOnlyCharSlice(this.#buffer, start, end);
    }

    /**
     * Creates a new ReadOnlyCharSlice that is the result of trimming the
     * start and end of this ReadOnlyCharSlice by a slice of characters.
     * @param slice The slice of characters to trim.
     * @returns A new ReadOnlyCharSlice.
     */
    trim(slice?: CharSliceLike): ReadOnlyCharSlice {
        if (slice === undefined) {
            return this.trimSpace();
        }

        if (slice.length === 1) {
            return this.trimChar(slice.at(0) ?? -1);
        }

        return this.trimSlice(slice);
    }

    /**
     * Converts the ReadOnlyCharSlice to a string.
     *
     * This will create a new string every time it is called.
     *
     * @returns A string representation of the ReadOnlyCharSlice.
     */
    toString(): string {
        return String.fromCodePoint(...this.#buffer.slice(this.#start, this.#end));
    }
}

/**
 * A slice of a character buffer.
 * The slice is a view of the buffer and the buffer is not copied.
 *
 * This is a specialized slice type for working with string characters in their
 * uint32 codepoint format and provide string like methods such as trim, indexof, toUpper,
 * toLower, includes, and more without the need to convert them back into strings to perform
 * those operations.
 */
export class CharSlice implements CharSequence, Iterable<number> {
    #buffer: Uint32Array;
    #start: number;
    #end: number;

    /**
     * Creates a new instance of the CharSlice class.
     * @param buffer The buffer to slice.
     * @param start The start index of the slice.
     * @param end The end index of the slice.
     */
    constructor(buffer: Uint32Array, start = 0, end?: number) {
        this.#buffer = buffer;
        this.#start = start;
        this.#end = end ?? buffer.length - start;
    }

    /**
     * Gets the length of the slice.
     */
    get length(): number {
        return this.#end;
    }

    /**
     * Gets a value indicating whether the slice is empty.
     */
    get isEmpty(): boolean {
        return this.length === 0;
    }

    [Symbol.iterator](): Iterator<number> {
        let index = 0;
        const set = this.#buffer;
        const offset = this.#start;
        const length = this.#end;
        return {
            next(): IteratorResult<number> {
                if (index < length) {
                    return { done: false, value: set[offset + index++] };
                }
                return { done: true, value: undefined };
            },
        };
    }

    /**
     * Creates a `CharSlice` from a string which allocates a new buffer
     * using a new `Uint32Array`.
     * @param s The string to convert to a `CharSlice`.
     * @returns The `CharSlice` representation of the string.
     */
    static fromString(s: string): CharSlice {
        const buffer = new Uint32Array(s.length);
        for (let i = 0; i < s.length; i++) {
            buffer[i] = s.codePointAt(i) ?? 0;
        }
        return new CharSlice(buffer);
    }

    /**
     * Gets the element at the specified index.
     * @param index The index of the element to get.
     * @returns The element at the specified index.
     * @throws RangeError if the index is less than 0 or
     * greater than or equal to the length of the slice.
     */
    at(index: number): number {
        if (index < 0 || index >= this.#end) {
            throw new RangeError("Argument 'index' must be greater than or equal to 0.");
        }
        return this.#buffer[this.#start + index];
    }

    /**
     * Sets the element at the specified index.
     * @param index The index of the element to set.
     * @param value The value to set.
     * @throws RangeError if the index is less than 0 or
     * greater than or equal to the length of the slice.
     */
    set(index: number, value: number) {
        if (index < 0 || index >= this.#end) {
            throw new RangeError("Argument 'index' must be greater than or equal to 0.");
        }
        this.#buffer[this.#start + index] = value;
    }

    /**
     * Iterates over the elements of the slice.
     * @param callback Callback function to call for each element.
     * @returns The updated ReadOnlyCharSlice.
     */
    forEach(callback: (value: number, index: number) => void): this {
        for (let i = 0; i < this.length; i++) {
            callback(this.#buffer[this.#start + i], i);
        }

        return this;
    }

    /**
     * Map will iterate over the elements of the slice and call the callback function
     * for each element. The element at the index will be replaced with the result
     * of the callback.
     * @param callback Callback function to call for each element.
     * @returns
     */
    map(callback: (value: number, index: number) => number): this {
        for (let i = 0; i < this.length; i++) {
            this.#buffer[i] = callback(this.#buffer[this.#start + i], i);
        }

        return this;
    }

    /**
     * Replace will replace the element at the specified index with the given value.
     * @param index The index of the element to replace.
     * @param value The value to replace the element with.
     * @returns The updated ReadOnlyCharSlice.
     * @throws RangeError if the index is less than 0 or
     * greater than or equal to the length of the slice.
     */
    replace(index: number, value: string | CharSliceLike): this {
        if (index < 0 || index >= this.#end) {
            throw new RangeError("Argument 'index' must be greater than or equal to 0.");
        }

        if (typeof value === "string") {
            value = toCharSliceLike(value);
        }

        if (index + value.length > this.#end) {
            throw new RangeError("Argument 'value' must be greater than or equal to 0.");
        }

        for (let i = 0; i < value.length; i++) {
            this.#buffer[this.#start + index + i] = value.at(i) ?? 0;
        }

        return this;
    }

    /**
     * Capitalize will capitalize the first character of the slice. All
     * other characters will be converted to lower case.
     * @returns the current CharSlice.
     */
    captialize(): this {
        this.#buffer[this.#start] = toUpper(this.#buffer[this.#start]);

        for (let i = this.#start + 1; i < this.#end; i++) {
            this.#buffer[i] = toLower(this.#buffer[i]);
        }

        return this;
    }

    /**
     * FindIndex will iterate over the elements of the slice and call the predicate function
     * for each element. The index of the first element for which the predicate returns true
     * will be returned. If no element is found, -1 will be returned.
     * @param predicate The predicate function to call for each element.
     * @returns The index of the first element for which the predicate returns true,
     * or -1 if no element is found.
     */
    findIndex(predicate: (value: number, index: number, set: Uint32Array) => boolean): number {
        for (let i = 0; i < this.length; i++) {
            if (predicate(this.#buffer[this.#start + i], i, this.#buffer)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Determines if the ReadOnlyCharSlice includes the given value.
     * @param value The value to check for.
     * @param index The index to start the search at.
     * @returns The index of the first occurrence of the given value in
     * the ReadOnlyCharSlice, or -1 if not found.
     */
    includes(value: CharBuffer, index = 0): boolean {
        return this.indexOf(value, index) !== -1;
    }

    /**
     * Determines if the ReadOnlyCharSlice includes the given value
     * using a case-insensitive comparison.
     * @param value The value to check for.
     * @param index The index to start the search at.
     * @returns The index of the first occurrence of the given value in
     * the ReadOnlyCharSlice, or -1 if not found.
     */
    includesFold(value: CharBuffer, index = 0): boolean {
        return this.indexOfFold(value, index) !== -1;
    }

    indexOf(value: CharBuffer, index = 0): number {
        return indexOf(this, value, index);
    }

    indexOfFold(value: CharBuffer, index = 0): number {
        return indexOfFold(this, value, index);
    }

    lastIndexOf(value: CharBuffer, index = 0): number {
        return lastIndexOf(this, value, index);
    }

    lastIndexOfFold(value: CharBuffer, index = 0): number {
        return lastIndexOfFold(this, value, index);
    }

    equals(other: CharBuffer): boolean {
        return equal(this, other);
    }

    equalsFold(other: CharBuffer): boolean {
        return equalFold(this, other);
    }

    endsWith(suffix: CharBuffer): boolean {
        return endsWith(this, suffix);
    }

    endsWithFold(suffix: CharBuffer): boolean {
        return endsWithFold(this, suffix);
    }

    slice(start = 0, end = this.length): CharSlice {
        if (start < 0 || start >= this.length) {
            throw new RangeError("Argument 'start' must be greater than or equal to 0.");
        }

        if (end < 0 || end > this.length) {
            throw new RangeError("Argument 'end' must be greater than or equal to 0.");
        }

        return new CharSlice(this.#buffer, this.#start + start, this.#start + end);
    }

    sliceSequence(start: number, end?: number): CharSlice {
        return this.slice(start, end);
    }

    startsWith(prefix: CharBuffer): boolean {
        return startsWith(this, prefix);
    }

    startsWithFold(prefix: CharBuffer): boolean {
        return startsWithFold(this, prefix);
    }

    toArray(): Uint32Array {
        return this.#buffer.slice(this.#start, this.#end);
    }

    /**
     * Returns new `CharSlice` that has lower characters
     * @returns a new charslices with all lower characters.
     */
    toLower(): this {
        for (let j = this.#start; j < this.#end; j++) {
            this.#buffer[j] = toLower(this.#buffer[j]);
        }

        return this;
    }

    toUpper(): this {
        for (let j = this.#start; j < this.#end; j++) {
            this.#buffer[j] = toLower(this.#buffer[j]);
        }

        return this;
    }

    trimStartSpace(): CharSlice {
        let start = this.#start;
        const end = this.#end;
        while (start < end && isSpace(this.#buffer[start])) {
            start++;
        }

        return new CharSlice(this.#buffer, start, end);
    }

    trimStartChar(c: number): CharSlice {
        let start = this.#start;
        const end = this.#end;
        while (start < end && this.#buffer[start] === c) {
            start++;
        }

        return new CharSlice(this.#buffer, start, end);
    }

    trimStartSlice(t: CharSliceLike | string): CharSlice {
        if (typeof t === "string") {
            t = toCharSliceLike(t);
        }

        let start = this.#start;
        const end = this.#end;
        while (start < end) {
            let match = false;
            for (let i = 0; i < t.length; i++) {
                if (this.#buffer[start] === t.at(i)) {
                    start++;
                    match = true;
                    break;
                }
            }

            if (!match) {
                break;
            }
        }

        return new CharSlice(this.#buffer, start, end);
    }

    trimStart(t?: CharSliceLike | string): CharSlice {
        if (t === undefined) {
            return this.trimStartSpace();
        }

        if (t.length === 1) {
            if (typeof t === "string") {
                t = toCharSliceLike(t);
            }

            return this.trimStartChar(t.at(0) ?? -1);
        }

        return this.trimStartSlice(t);
    }

    trimEndSpace(): CharSlice {
        const start = this.#start;
        let end = this.#end;
        while (start < end && isSpace(this.#buffer[end - 1])) {
            end--;
        }

        return new CharSlice(this.#buffer, start, end);
    }

    trimEndChar(c: number): CharSlice {
        const start = this.#start;
        let end = this.#end;
        while (start < end && this.#buffer[end - 1] === c) {
            end--;
        }

        return new CharSlice(this.#buffer, start, end);
    }

    trimEndSlice(t: CharSliceLike | string): CharSlice {
        if (typeof t === "string") {
            t = toCharSliceLike(t);
        }

        const start = this.#start;
        let end = this.#end;
        while (start < end) {
            let match = false;
            for (let i = 0; i < t.length; i++) {
                if (this.#buffer[end - 1] === t.at(i)) {
                    end--;
                    match = true;
                    break;
                }
            }

            if (!match) {
                break;
            }
        }

        return new CharSlice(this.#buffer, start, end);
    }

    trimEnd(t?: CharSliceLike | string): CharSlice {
        if (t === undefined) {
            return this.trimEndSpace();
        }

        if (t.length === 1) {
            if (typeof t === "string") {
                t = toCharSliceLike(t);
            }

            return this.trimEndChar(t.at(0) ?? -1);
        }

        return this.trimEndSlice(t);
    }

    trimSpace(): CharSlice {
        let start = this.#start;
        let end = this.#end;
        while (start < end && isSpace(this.#buffer[start])) {
            start++;
        }

        while (start < end && isSpace(this.#buffer[end - 1])) {
            end--;
        }

        return new CharSlice(this.#buffer, start, end);
    }

    trimChar(c: number): CharSlice {
        let start = this.#start;
        let end = this.#end;
        while (start < end && this.#buffer[start] === c) {
            start++;
        }

        while (start < end && this.#buffer[end - 1] === c) {
            end--;
        }

        return new CharSlice(this.#buffer, start, end);
    }

    trimSlice(t: CharSliceLike | string): CharSlice {
        if (typeof t === "string") {
            t = toCharSliceLike(t);
        }

        let start = this.#start;
        let end = this.#end;
        while (start < end) {
            let match = false;
            for (let i = 0; i < t.length; i++) {
                if (this.#buffer[start] === t.at(i)) {
                    start++;
                    match = true;
                    break;
                }
            }

            if (!match) {
                break;
            }
        }

        while (start < end) {
            let match = false;
            for (let i = 0; i < t.length; i++) {
                if (this.#buffer[end - 1] === t.at(i)) {
                    end--;
                    match = true;
                    break;
                }
            }

            if (!match) {
                break;
            }
        }

        return new CharSlice(this.#buffer, start, end);
    }

    trim(t?: CharSliceLike | string): CharSlice {
        if (t === undefined) {
            return this.trimSpace();
        }

        if (t.length === 1) {
            if (typeof t === "string") {
                t = toCharSliceLike(t);
            }
            return this.trimChar(t.at(0) ?? -1);
        }

        return this.trimSlice(t);
    }

    /**
     * Converts the CharSlice to a string.
     *
     * This will create a new string every time it is called.
     *
     * @returns The string representation of the CharSlice.
     */
    toString(): string {
        return String.fromCodePoint(...this.#buffer.slice(this.#start, this.#end));
    }
}
