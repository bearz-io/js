import type { SecretVault, SecretRecord } from "@rex/vaults/types";
import { cmd } from "@bearz/exec";
import { underscore } from "@bearz/strings/underscore";
import { parse, stringify } from "@bearz/dotenv";
import { readTextFile, writeTextFile, makeTempFile } from "@bearz/fs";
import { dirname } from "@std/path";

export interface SopsVaultParams {
    name: string;
    path: string;
    autoSave: boolean;
    driver: "age" | "aws" | "gcp" | "azure" | "pgp";
    age?: {
        recipients?: string;
        keyFile?: string;
        key?: string;
    }
    config?: string;
    vaultUri?: string;
    gcpKmsUri?: string;
    kmsArns?: string;
    pgpFingerprints?: string;
    azureKvUri?: string;
}

export class SopsVault implements SecretVault {
    #slim: Promise<void>;
    #params: SopsVaultParams;
    #data: Record<string, SecretRecord | undefined> = {};
    #loaded = false;

    constructor(params: SopsVaultParams) {
        this.#params = params;
        this.#slim = Promise.resolve();
    }

    get name(): string {
        return this.#params.name;
    }

    get driver(): string {
        return "sops";
    }

    async getSecret(key: string): Promise<SecretRecord | undefined> {
        key = underscore(key, { screaming: true});
        await this.load();
        const secret = this.#data[key];
        if (secret) {
            return secret;
        }

        return undefined;
    }

    async getSecretValue(key: string): Promise<string | undefined> {
        const secret = await this.getSecret(key);
        if (secret) {
            return secret.value;
        }

        return undefined;
    }

    async setSecret(key: string, value: string): Promise<void> {
        key = underscore(key, { screaming: true});
        await this.load();
        let model = this.#data[key];
        if (!model) {
            model = {
                name: key,
                value: value,
                tags: {},
                version: "1",
            };
            this.#data[key] = model;
        } else {
            model.value = value;
        }

        if (this.#params.autoSave)
            await this.save();
    }

    async deleteSecret(key: string): Promise<void> {
        key = underscore(key, { screaming: true});
        await this.load();
        delete this.#data[key];
        if (this.#params.autoSave)
            await this.save();
    }

    async listSecrets(): Promise<SecretRecord[]> {
        await this.load();
        return Object.values(this.#data).filter((s) => s !== undefined) as SecretRecord[];
    }

    async listSecretNames(): Promise<string[]> {
        const secrets = await this.listSecrets();
        return secrets.map((s) => s.name);
    }

    load(force = false): Promise<void> {
        if (!force && this.#loaded) {
            return this.#slim;
        }

        return this.#slim.then(async () => {

            const vars : Record<string, string> = {};
            switch(this.#params.driver) {
                case "age":
                    if (this.#params.age) {
                        if (this.#params.age.keyFile) {
                            vars["SOPS_AGE_KEY_FILE"] = this.#params.age.keyFile;
                        } else if (this.#params.age.key) {
                             vars["SOPS_AGE_KEY"] = this.#params.age.key;
                        }
                    }

                break;
            }

            const args : string[] = ["decrypt"]
            if (this.#params.config && this.#params.config.length > 0) {
                args.push("--config", this.#params.config);
            }

            args.push(this.#params.path);
            const dir = dirname(this.#params.path)

            const o = await cmd("sops", args, {
                env: vars,
                cwd: dir,
            }).output();
            const envContent = o.text();
            const data = parse(envContent)
            this.#data = {};
            for (const key in data) {
                const value = data[key];
                this.#data[key] = {
                    name: key,
                    value: value,
                    tags: {},
                    version: "1",
                }
            }
        });
    }

    save(): Promise<void> {
        return this.#slim.then(async () => {
            const backup = await readTextFile(this.#params.path);
            try {
                const envData : Record<string, string> = {};
                for (const key in this.#data) {
                    const secret = this.#data[key];
                    if (!secret) {
                        continue;
                    }

                    envData[secret.name] = secret.value!;
                }

                const data = stringify(envData);
                writeTextFile(this.#params.path, data);

                const args : string[] = ["-e"];
                const vars : Record<string, string> = {};
                switch(this.#params.driver) {
                    case "age":
                        if (this.#params.age) {
                            if (this.#params.age.recipients) {
                                args.push("--age", this.#params.age.recipients);
                            }

                            if (this.#params.age.keyFile) {
                               vars["SOPS_AGE_KEY_FILE"] = this.#params.age.keyFile;
                            } else if (this.#params.age.key) {
                                vars["SOPS_AGE_KEY"] = this.#params.age.key;
                            }
                        }
                    break;
                    case "aws":
                        if (this.#params.kmsArns) {
                            args.push("--kms", this.#params.kmsArns);
                        }
                        break;
                    
                    case "gcp":
                        if (this.#params.gcpKmsUri) {
                            args.push("--gcp-kms", this.#params.gcpKmsUri);
                        }
                        break;

                    case "azure":
                        if (this.#params.azureKvUri) {
                            args.push("--azure-kv", this.#params.azureKvUri);
                        }
                        break;

                    case "pgp":
                        if (this.#params.pgpFingerprints) {
                            args.push("--pgp", this.#params.pgpFingerprints);
                        }
                        break;
                }

                args.push("-i")
                args.push(this.#params.path);
                const dir = dirname(this.#params.path)

                const o = await cmd("sops", args, {
                    env: vars,
                    cwd: dir,
                }).output();
                o.validate();
            } catch (e) {
                const tmp = await makeTempFile({ prefix: "sops", suffix: ".env" });
                writeTextFile(tmp, backup);
                writeTextFile(this.#params.path, backup);
                throw new Error(`Failed to save the vault. The previous content has been restored to ${tmp}.`, { cause: e });
            }
        });
    }
}