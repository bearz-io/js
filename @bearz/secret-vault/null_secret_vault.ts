import { NotFoundError } from "../errors/not_found_error.ts";
import { fail, ok, type Result, voided } from "../functional/src/result.ts";
import type {
    GetSecretParams,
    SecretOperationParams,
    SecretProperties,
    SecretRecord,
    SecretVaultClient,
    SecretVaultFeatures,
} from "./types.ts";

/**
 * Represents a secret vault that does not store any secrets.
 */
export class NullSecretVault implements SecretVaultClient {
    /**
     * Creates a new null secret vault.
     * @param name The name of the vault.
     */
    constructor(public readonly name: string) {
        this.driver = "null";
    }

    /**
     * The name of the driver.
     */
    readonly driver: string;

    supports(_feature: SecretVaultFeatures): boolean {
        return false;
    }

    /**
     * Gets a secret from the vault.
     * @param _name The name of the secret.
     * @param _params The parameters for the operation.
     * @returns The secret record, or undefined if the secret does not exist.
     */
    getSecret(name: string, _params?: GetSecretParams): Promise<Result<SecretRecord>> {
        return Promise.resolve(fail(new NotFoundError(name)));
    }

    /**
     * Gets the value of a secret from the vault.
     * @param _name The name of the secret.
     * @param _params The parameters for the operation.
     * @returns The value of the secret, or undefined if the secret does not exist.
     */
    getSecretValue(_name: string, _params?: GetSecretParams): Promise<Result<string>> {
        return Promise.resolve(fail(new NotFoundError(_name)));
    }

    /**
     * Lists the names of the secrets in the vault.
     * @param _params The parameters for the operation.
     * @returns The names of the secrets in the vault.
     */
    listSecretNames(_params?: SecretOperationParams): Promise<Result<string[]>> {
        return Promise.resolve(ok([]));
    }

    /**
     * Lists the secrets in the vault.
     * @param _params The parameters for the operation.
     * @returns The secret records.
     */
    listSecrets(_params?: GetSecretParams): Promise<Result<SecretRecord[]>> {
        return Promise.resolve(ok([]));
    }

    /**
     * Sets the value of a secret in the vault.
     * @param _name The name of the secret.
     * @param _value The value of the secret.
     * @param _params The parameters for the operation.
     * @returns The promise that resolves when the secret is set.
     */
    setSecret(_name: string, _value: string, _params?: GetSecretParams): Promise<Result<void>> {
        return Promise.resolve(voided());
    }

    /**
     * Deletes a secret from the vault by its name.
     * @param _name The name of the secret to delete.
     * @param _params The parameters for the operation.
     * @returns The promise that resolves when the secret is deleted.
     */
    deleteSecret(_name: string, _params?: GetSecretParams): Promise<Result<void>> {
        return Promise.resolve(voided());
    }

    /**
     * Updates the properties of a secret in the vault.
     * @param _name The name of the secret.
     * @param _properties The properties to update.
     * @param _params The parameters for the operation.
     * @returns The promise that resolves when the secret properties are updated.
     */
    upateSecretProperties(
        _name: string,
        _properties: SecretProperties,
        _params?: GetSecretParams,
    ): Promise<Result<void>> {
        return Promise.resolve(voided());
    }
}

/**
 * Creates a new null secret vault.
 */
export const nullSecretVault : NullSecretVault = new NullSecretVault("null");