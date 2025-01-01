/**
 * Represents a secret record.
 */
/**
 * Represents a secret record.
 */
export interface SecretRecord extends Record<string | symbol, unknown> {
    /**
     * The name of the secret.
     */
    readonly name: string;

    /**
     * The value of the secret.
     */
    value?: string;

    /**
     * The expiration date of the secret.
     */
    expiresAt?: Date;

    /**
     * The creation date of the secret.
     */
    createdAt?: Date;

    /**
     * Additional tags associated with the secret.
     */
    tags?: Record<string, string>;

    /**
     * The version of the secret.
     */
    readonly version?: string;
}

/**
 * Represents a vault that stores secrets.
 */
export interface SecretVault {
    /**
     * The name of the vault.
     */
    readonly name: string;

    readonly driver: string;

    /**
     * Retrieves a secret from the vault.
     * @param name - The name of the secret.
     * @returns A promise that resolves to the secret record, or undefined if the secret does not exist.
     */
    getSecret(name: string): Promise<SecretRecord | undefined>;

    /**
     * Retrieves the value of a secret from the vault.
     * @param name - The name of the secret.
     * @returns A promise that resolves to the value of the secret, or undefined if the secret does not exist.
     */
    getSecretValue(name: string): Promise<string | undefined>;

    /**
     * Sets the value of a secret in the vault.
     * @param name - The name of the secret.
     * @param value - The value of the secret.
     * @returns A promise that resolves when the secret is set.
     */
    setSecret(name: string, value: string): Promise<void>;

    /**
     * Deletes a secret from the vault by its name.
     * @param name - The name of the secret to delete.
     * @returns A promise that resolves when the secret is deleted.
     */
    deleteSecret(name: string): Promise<void>;

    /**
     * Lists all secrets in the vault.
     * @returns A promise that resolves to an array of secret records.
     */
    listSecrets(): Promise<SecretRecord[]>;

    /**
     * Lists the names of all secrets in the vault.
     * @returns A promise that resolves to an array of secret names.
     */
    listSecretNames(): Promise<string[]>;
}


export interface SecretDef extends Record<string | symbol, unknown> {
    name: string;
    use?: string
    key?: string;
    vault?: string;
    gen?: boolean
    special?: string;
    digits?: boolean;
    lower?: boolean;
    upper?: boolean;
    size?: number;
}

export interface VaultDef extends Record<string | symbol, unknown> {
    name: string
    uri: string
    use: string
    with?: Record<string, unknown>
}

export interface SecretsPartialConfig extends Record<string | symbol, unknown> {
    secrets: SecretDef[]
    vaults: VaultDef[]
}

export interface SecretsVaultConfigLoader {
    canHandle(uri: URL): boolean
    load(config: VaultDef) : SecretVault
}