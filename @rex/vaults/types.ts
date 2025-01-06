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

export interface SecretParam extends Record<string | symbol, unknown> {
    name: string;
    use?: string;
    key?: string;
    vault?: string;
    gen?: boolean;
    special?: string;
    digits?: boolean;
    lower?: boolean;
    upper?: boolean;
    size?: number;
}

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
     * the `with` properties.  e.g.  `sops-cli:./etc/secrets.env?sops-config=./etc/.sops.yaml&age-key-file=./etc/keys.txt`
     * instructs the configuration to use the module `@rex/vaults-sops-cli` with file path of ./etc/secrets/env and
     * the parameters are key value pairs.
     *
     * Third-party modules will need to have the org in the protocol where the org/scope is seperated with two hyphens:
     * `myorg--mymodule:./etc/secrets.env?sops-config=./etc/.sops.yaml&age-key-file=./etc/keys.txt`
     */
    uri?: string;
    /**
     * The name of the vault driver.  Rex modules can use shorthand names for drivers.
     * For example, the `@rex/vaults-sops-cli` module is mapped the shorthand name `sops-cli`.
     *
     * Other 3rd party modules can be used by specifying the full import path where jsr is assumed
     * to be the repository for the module.  For example, `@myorg/mymodule`.  The module must
     * have a ./factory sub-mobule that exports a factory instance.
     */
    use?: string;
    /**
     * The configuration for the vault where each key is a configuration parameter. You will
     * need to refer to the documentation for the specific vault driver to determine the
     * the available configuration parameters.
     */
    with?: Record<string, unknown>;
}

export interface SecretsPartialConfig extends Record<string | symbol, unknown> {
    secrets: SecretParam[];
    vaults: SecretVaultParams[];
}

export interface SecretsVaultFactory {
    canBuild(params: SecretVaultParams): boolean;
    build(params: SecretVaultParams): SecretVault;
}
