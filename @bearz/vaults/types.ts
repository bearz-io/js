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

export type SecretVaultFeatures =  'list' | 'list:names' | 'prop:tags' | 'prop:expires' | 'prop:created' | 'prop:enabled' | 'prop:version' | 'properties' | string;

/**
 * Represents a vault that stores secrets.
 */
export interface SecretVault {
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
    upateSecretProperties(name: string, properties: SecretProperties, params?: SecretOperationParams): Promise<Result<void>>;
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

/**
 * Represents the parameters for a registering a secret vault.
 */
export interface SecretVaultParams extends Record<string | symbol, unknown> {
    /**
     * The name of the vault. This is used to reference the vault in other tasks.
     */
    name: string;
    /**
     * The configuration uri for the vault. Configuration can be done with the `uri` or the
     * the `with` properties.  e.g.  `sops-cli:./etc/secrets.env?use=@spawn/sops@0.1.0`
     * instructs the configuration to dynamically load use the module `@spawn/sops` with version `0.1.-=0` with file path of ./etc/secrets/env and
     * the parameters are key value pairs.
     *
     * To dynamically load third-party modules, you should use the `use` property or add `use` to the query string.
     */
    uri?: string;
    /**
     * The name of the vault driver. If the driver is configured with a abbreivation in the registry, it will load. Otherwise,
     * you'll need to use provide the scope and module. Optionally, you can provide the version.
     */
    use?: string;
    /**
     * The configuration for the vault where each key is a configuration parameter. You will
     * need to refer to the documentation for the specific vault driver to determine the
     * the available configuration parameters.
     */
    with?: Record<string, unknown>;
}

/**
 * Represents a factory for creating secret vaults.
 */
export interface SecretsVaultFactory {
    /**
     * Determines if the factory can build a secret vault with the given parameters.
     * @param params The parameters for the secret vault.
     * return `true` if the factory can build the secret vault, otherwise `false`.
     */
    match(params: SecretVaultParams): boolean;

    /**
     * Builds a secret vault with the given parameters.
     * @param params The parameters for the secret vault.
     * @returns A new instance of the secret vault.
     */
    build(params: SecretVaultParams): SecretVault;
}
