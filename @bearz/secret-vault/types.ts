import type { Result } from "@bearz/functional";

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
     *
     * Some vaults may not support tags or may only support
     * using tag names.
     */
    tags?: Record<string, string | undefined>;

    /**
     * Determines if the secret is enabled.
     */
    enabled?: boolean;

    /**
     * The version of the secret.
     */
    readonly version?: string;
}

/**
 * Represents the properties of a secret.
 */
export interface SecretProperties extends Record<string, unknown> {
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
     *
     * Some vaults may not support tags or may only support
     * using tag names.
     */
    tags?: Record<string, string>;

    /**
     * Determines if the secret is enabled.
     */
    enabled?: boolean;
}

/**
 * The core parameters for secret operations.
 */
export interface SecretOperationParams {
    /**
     * The signal used to cancel the operation.
     */
    signal?: AbortSignal;
}

/**
 * The parameters for getting a secret.
 */
export interface GetSecretParams extends SecretOperationParams {
    /**
     * The version of the secret to get. If not provided, the latest version is returned.
     */
    version?: string;
}

/**
 * Features supported by the secret vault.
 */
export type SecretVaultFeatures =
    | "list"
    | "list:names"
    | "prop:tags"
    | "prop:expires"
    | "prop:created"
    | "prop:enabled"
    | "prop:version"
    | "properties"
    | string;

/**
 * Represents a vault that stores secrets.
 */
export interface SecretVaultClient {
    /**
     * The name of the vault.
     */
    readonly name: string;

    /**
     * The driver used by the vault.
     */
    readonly driver: string;

    /**
     * The features supported by the vault.
     */
    supports(feature: SecretVaultFeatures): boolean;

    /**
     * Retrieves a secret from the vault.
     * @param name - The name of the secret.
     * @param params - The parameters for the operation.
     * @returns A result that resolves to the secret record if successful, a NotFoundError if the secret does not exist,
     * or other unexpected errors if it fails.
     */
    getSecret(name: string, params?: GetSecretParams): Promise<Result<SecretRecord>>;

    /**
     * Retrieves the value of a secret from the vault.
     * @param name - The name of the secret.
     * @param params - The parameters for the operation.
     * @returns A result that value of the secret if successfull, a NotFoundError if the secret does not exist,
     * or other unexpected errors if it fails.
     */
    getSecretValue(name: string, params?: GetSecretParams): Promise<Result<string>>;

    /**
     * Sets the value of a secret in the vault.
     * @param name - The name of the secret.
     * @param value - The value of the secret.
     * @param params - The parameters for the operation.
     * @returns A result that is Ok if the operation was successful, otherwise an error.
     */
    setSecret(name: string, value: string, params?: SecretOperationParams): Promise<Result<void>>;

    /**
     * Deletes a secret from the vault by its name.
     *
     * @param name - The name of the secret to delete.
     * @param params - The parameters for the operation.
     * @returns A result that is Ok if the operation was successful, otherwise an error.
     */
    deleteSecret(name: string, params?: SecretOperationParams): Promise<Result<void>>;

    /**
     * Lists all secrets in the vault.
     * @param params - The parameters for the operation.
     * @returns A result that resolves to an array of secret records if operation was successful,
     * otherwise, an error.
     */
    listSecrets(params?: SecretOperationParams): Promise<Result<SecretRecord[]>>;

    /**
     * Lists the names of all secrets in the vault.
     * @param params - The parameters for the operation.
     * @returns A result that resolves to an array of secret names if operation was successful,
     * otherwise, an error.
     */
    listSecretNames(params?: SecretOperationParams): Promise<Result<string[]>>;

    /**
     * Updates the properties of a secret in the vault.
     * @param name The name of the secret.
     * @param properties The properties to update.
     * @param params The parameters for the operation.
     * @returns A result that has a fail of Ok if the operation was successful, otherwise an error.
     */
    upateSecretProperties(
        name: string,
        properties: SecretProperties,
        params?: SecretOperationParams,
    ): Promise<Result<void>>;
}

/**
 * Represents a collection of secret records.
 */
export interface SecretParam extends Record<string | symbol, unknown> {
    /**
     * The name of the secret which is used to reference within
     * the application.
     */
    name: string;

    /**
     * The vault to use for the secret.
     */
    use?: string;

    /**
     * The key to use for the secret which is used to reference
     * within the vault. Defaults to the name if not provided.
     */
    key?: string;

    /**
     * The value of the secret.
     */
    gen?: boolean;

    /**
     * The special characters to use.
     */
    special?: string;

    /**
     * Use digits in the secret.
     */
    digits?: boolean;

    /**
     * Use lowercase letters in the secret.
     */
    lower?: boolean;

    /**
     * Use uppercase letters in the secret.
     */
    upper?: boolean;

    /**
     * The characters to use in the secret. Negates the use of
     * `special`, `digits`, `lower`, and `upper`.
     */
    chars?: string;

    /**
     * The length of the secret.
     */
    size?: number;
}

/**
 * Represents a collection of secret parameters.
 */
export type SecretParams = SecretParam[];
