import { isDigit, isLetter, isUpper } from "@bearz/chars";

function randomBytes(length: number): Uint8Array {
    const buffer = new Uint8Array(length);
    globalThis.crypto.getRandomValues(buffer);
    return buffer;
}

/**
 * Validates whether the given data meets the password requirements.
 * The password must contain at least one digit, one uppercase letter,
 * one lowercase letter, and one special character.
 *
 * @param data - The data to be validated as a Uint8Array.
 * @returns A boolean indicating whether the data meets the password requirements.
 */
export function validate(data: Uint8Array): boolean {
    let hasDigit = false;
    let hasUpper = false;
    let hasLower = false;
    let hasSpecial = false;

    for (let i = 0; i < data.length; i++) {
        const c = data[i];
        // throw?
        if (c === undefined) {
            continue;
        }

        if (isLetter(c)) {
            if (isUpper(c)) {
                hasUpper = true;
                continue;
            }

            hasLower = true;
            continue;
        }

        if (isDigit(c)) {
            hasDigit = true;
            continue;
        }

        hasSpecial = true;
    }

    return hasDigit && hasUpper && hasLower && hasSpecial;
}

/**
 * Represents a secret generator.
 */
export interface SecretGenerator {
    /**
     * Sets a validator function for generated secrets.
     * @param validator - The validator function that takes a Uint8Array value and returns a boolean indicating whether the value is valid.
     */
    setValidator(validator: (value: Uint8Array) => boolean): void;

    /**
     * Adds a value to the secret generator.
     * @param value - The value to add.
     * @returns The updated SecretGenerator instance.
     */
    add(value: string): SecretGenerator;

    /**
     * Generates a secret of the specified length.
     * @param length - The length of the generated secret.
     * @returns The generated secret as a string.
     */
    generate(length: number): string;

    /**
     * Generates a secret as a Uint8Array of the specified length.
     * @param length - The length of the generated secret.
     * @returns The generated secret as a Uint8Array.
     */
    generateAsUint8Array(length: number): Uint8Array;
}

/**
 * Represents a default secret generator.
 */
export class DefaultSecretGenerator {
    #codes: number[];
    #validator: (value: Uint8Array) => boolean;

    /**
     * Creates an instance of DefaultSecretGenerator.
     */
    constructor() {
        this.#codes = [];
        this.#validator = validate;
    }

    /**
     * Sets a custom validator function for generated secrets.
     * @param validator - The validator function that takes a Uint8Array value and returns a boolean.
     * @returns The current instance of DefaultSecretGenerator.
     */
    setValidator(validator: (value: Uint8Array) => boolean): this {
        this.#validator = validator;
        return this;
    }

    /**
     * Adds default characters to the secret generator.
     * @returns The current instance of DefaultSecretGenerator.
     */
    addDefaults(): this {
        this.add(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-#@~*:{}",
        );
        return this;
    }

    /**
     * Adds characters to the secret generator.
     * @param value - The characters to be added.
     * @returns The current instance of DefaultSecretGenerator.
     */
    add(value: string): this {
        for (let i = 0; i < value.length; i++) {
            const c = value.codePointAt(i);
            if (c === undefined) {
                continue;
            }

            if (this.#codes.includes(c)) {
                continue;
            }

            this.#codes.push(c);
        }

        return this;
    }

    /**
     * Generates a secret as a Uint8Array.
     * @param length - The length of the secret to be generated.
     * @returns A Uint8Array representing the generated secret.
     * @throws InvalidOperationError if the secret generation fails.
     */
    generateAsUint8Array(length: number): Uint8Array {
        // useful for generating a password that can be cleared from memory
        // as strings are immutable in JavaScript
        let valid = false;
        const chars: Uint8Array = new Uint8Array(length);
        const maxAttempts = 5000;
        let attempts = 0;

        while (!valid && attempts < maxAttempts) {
            chars.fill(0);
            const bytes = randomBytes(length);

            for (let i = 0; i < length; i++) {
                const bit = Math.abs(bytes[i]) % this.#codes.length;
                chars[i] = this.#codes[bit];
            }

            attempts++;
            valid = this.#validator(chars);
        }

        if (!valid) {
            throw new Error("Failed to generate secret");
        }

        return chars;
    }

    /**
     * Generates a secret as a string.
     * @param length - The length of the secret to be generated.
     * @returns A string representing the generated secret.
     * @throws InvalidOperationError if the secret generation fails.
     */
    generate(length: number): string {
        const chars = this.generateAsUint8Array(length);
        return String.fromCodePoint(...chars);
    }
}

/**
 * Generates a secret string of the specified length using the given characters.
 * If no characters are provided, the default character set will be used.
 *
 * @param length - The length of the secret string to generate.
 * @param characters - Optional. The characters to use for generating the secret string.
 * @returns The generated secret string.
 */
export function generateSecret(length: number, characters?: string): string {
    const generator = new DefaultSecretGenerator();
    if (characters) {
        generator.add(characters);
    } else {
        generator.addDefaults();
    }

    return generator.generate(length);
}

/**
 * The default global secret generator used to create cryptographically
 * random secrets.
 */
export const secretGenerator: DefaultSecretGenerator = new DefaultSecretGenerator().addDefaults();
