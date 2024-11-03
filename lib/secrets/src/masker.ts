/**
 * Represents a SecretMasker interface.
 */
export interface SecretMasker {
    /**
     * Adds a value to the SecretMasker.
     * @param value - The value to be added.
     * @returns The SecretMasker instance.
     */
    add(value: string): SecretMasker;

    /**
     * Adds a generator function to the SecretMasker.
     * @param generator - The generator function that takes a secret and returns a masked value.
     * @returns The SecretMasker instance.
     */
    addGenerator(generator: (secret: string) => string): SecretMasker;

    /**
     * Masks the provided value.
     * @param value - The value to be masked.
     * @returns The masked value or null if the input value is null.
     */
    mask(value: string | null): string | null;
}

/**
 * Represents a secret masker that can be used to mask sensitive information in strings.
 */
export class DefaultSecretMasker {
    #secrets: string[];
    #generators: Array<(secret: string) => string>;

    /**
     * Creates a new instance of DefaultSecretMasker.
     */
    constructor() {
        this.#secrets = [];
        this.#generators = [];
    }

    /**
     * Adds a secret value to the masker.
     * @param value - The secret value to add.
     * @returns The SecretMasker instance for method chaining.
     */
    add(value: string): SecretMasker {
        if (!this.#secrets.includes(value)) {
            this.#secrets.push(value);
        }

        this.#generators.forEach((generator) => {
            const next = generator(value);
            if (!this.#secrets.includes(next)) {
                this.#secrets.push(next);
            }
        });

        return this;
    }

    /**
     * Adds a generator function to the masker.
     * @param generator - The generator function that takes a secret value and returns a masked value.
     * @returns The SecretMasker instance for method chaining.
     */
    addGenerator(generator: (secret: string) => string): SecretMasker {
        this.#generators.push(generator);

        return this;
    }

    /**
     * Masks a given value by replacing any occurrences of secrets with asterisks.
     * @param value - The value to mask.
     * @returns The masked value.
     */
    mask(value: string | null): string | null {
        if (value === null) {
            return value;
        }

        let str: string = value;
        this.#secrets.forEach((next) => {
            const regex = new RegExp(`${next}`, "gi");

            str = str.replace(regex, "*******");
        });

        return str;
    }
}

/**
 * Represents a secret masker that can be used to mask sensitive information in strings.
 */
export const secretMasker: SecretMasker = new DefaultSecretMasker();
