import type {
    GetSecretParams,
    SecretOperationParams,
    SecretProperties,
    SecretRecord,
    SecretVaultClient,
    SecretVaultFeatures,
} from "@bearz/secret-vault/types";
import { fail, ok, type Result, voided } from "../../@bearz/functional/src/result.ts";
import type { DocumentSerializer, VaultDocument } from "./types.ts";
import { extname } from "@std/path/extname";
import { sops } from "./command.ts";
import { dirname, isAbsolute, resolve } from "@std/path";
import { exists, makeTempFile, NotFoundError, readTextFile, writeTextFile } from "@bearz/fs";
import { abort, coerceError } from "../../@bearz/functional/src/errors.ts";

export interface SpawnSopsSecretVaultClientParams {
    name: string;
    backupDir?: string;
    file: string;
    config?: string;
    autoSave?: boolean;
    age?: {
        recipients?: string;
        keyFile?: string;
        key?: string;
    };
    vault?: { uri?: string };
    gcp?: { uri?: string };
    aws?: { arns?: string };
    pgp?: { fingerprints?: string };
    azure?: { uri?: string };
    cwd?: string;
}

export class SpawnSopsSecretVaultClient implements SecretVaultClient {
    #params: SpawnSopsSecretVaultClientParams;
    #slim: Promise<void>;
    #document?: VaultDocument;
    #ext: ".env" | ".json" | ".yaml" | ".yml";
    #serializer?: DocumentSerializer;
    #loaded: boolean = false;

    constructor(params: SpawnSopsSecretVaultClientParams) {
        this.#params = params;
        this.#params.autoSave ??= true;
        this.#slim = Promise.resolve();
        this.#ext = extname(params.file) as ".env" | ".json" | ".yaml" | ".yml";
        if (![".json", ".yaml", ".yml", ".env"].includes(this.#ext)) {
            throw new Error("Unsupported file extension for SpawnSopsClient " + this.#ext);
        }
    }

    get name(): string {
        return this.#params.name;
    }

    get driver(): string {
        return "spawn-sops";
    }

    supports(feature: SecretVaultFeatures): boolean {
        if (this.#ext === ".env") {
            switch (feature) {
                case "list":
                case "list:names":
                    return true;
                default:
                    return false;
            }
        }

        switch (feature) {
            case "list":
            case "list:names":
            case "prop:tags":
            case "prop:expires":
            case "prop:created":
            case "prop:enabled":
            case "prop:version":
            case "properties":
                return true;
            default:
                return false;
        }
    }

    async getSecret(name: string, params?: GetSecretParams): Promise<Result<SecretRecord>> {
        if (params?.signal?.aborted) {
            return abort(params.signal);
        }

        if (!this.#loaded) {
            await this.load();
        }

        if (params?.version && params?.version.length > 0 && this.supports("prop:version")) {
            const docs = this.#document!;
            const secrets = docs.history[name];
            if (secrets && secrets.length > 0) {
                const secret = secrets.find((s) => s.version === params.version);
                if (secret) {
                    return ok(secret);
                }
            }

            return fail(new NotFoundError(`${name}/${params.version}`));
        }

        const secrets = this.#document!.secrets;
        const secret = secrets.find((s) => s.name === name);
        if (secret) {
            return ok(secret);
        }

        return fail(new NotFoundError(name));
    }

    getSecretValue(name: string, params?: GetSecretParams): Promise<Result<string>> {
        return this.getSecret(name, params).then((res) => {
            return res.tryMap((s) => s.value ?? "");
        });
    }

    async setSecret(
        name: string,
        value: string,
        params?: SecretOperationParams,
    ): Promise<Result<void>> {
        if (params?.signal?.aborted) {
            return abort(params.signal);
        }

        if (!this.#loaded) {
            await this.load();
        }

        const secrets = this.#document!.secrets;
        const history = this.#document!.history;
        const existing = secrets.find((s) => s.name === name);
        if (!existing) {
            const record: SecretRecord = {
                name: name,
                value: value,
                version: crypto.randomUUID(),
                createdAt: new Date(),
                enabled: true,
            };

            secrets.push(record);
            history[name] = [];

            if (!this.#params.autoSave) {
                return voided();
            }

            try {
                await this.save();
                return voided();
            } catch (e) {
                return coerceError(e);
            }
        }

        if (existing.value === value) {
            return voided();
        }

        existing.value = value;
        if (!this.#params.autoSave) {
            return voided();
        }

        try {
            await this.save();
            return voided();
        } catch (e) {
            return coerceError(e);
        }
    }

    async deleteSecret(name: string, params?: SecretOperationParams): Promise<Result<void>> {
        if (params?.signal?.aborted) {
            return abort(params.signal);
        }

        if (!this.#loaded) {
            await this.load();
        }

        const secrets = this.#document!.secrets;
        const history = this.#document!.history;
        const index = secrets.findIndex((s) => s.name === name);
        if (index > -1) {
            secrets.splice(index, 1);
            this.#document!.secrets = secrets;
        }

        delete history[name];
        this.#document!.history = history;

        try {
            await this.save();
            return voided();
        } catch (e) {
            return coerceError(e);
        }
    }

    async listSecrets(params?: SecretOperationParams): Promise<Result<SecretRecord[]>> {
        if (params?.signal?.aborted) {
            return abort(params.signal);
        }

        if (!this.#loaded) {
            await this.load();
        }

        return ok(this.#document!.secrets.slice());
    }

    listSecretNames(params?: SecretOperationParams): Promise<Result<string[]>> {
        return this.listSecrets(params).then((res) => {
            return res.tryMap((s) => s.map((secret) => secret.name));
        });
    }

    async upateSecretProperties(
        name: string,
        properties: SecretProperties,
        params?: SecretOperationParams,
    ): Promise<Result<void>> {
        if (params?.signal?.aborted) {
            return abort(params.signal);
        }

        if (!this.#loaded) {
            await this.load();
        }

        const existing = this.#document!.secrets.find((s) => s.name === name);
        if (!existing) {
            const record: SecretRecord = {
                name: name,
                value: properties.value ?? "",
                version: crypto.randomUUID(),
                createdAt: new Date(),
                enabled: properties.enabled ?? true,
            };

            if (properties.tags) {
                record.tags = properties.tags;
            }

            if (properties.expiresAt) {
                record.expiresAt = properties.expiresAt;
            }

            this.#document!.secrets.push(record);
            this.#document!.history[name] = [];

            if (!this.#params.autoSave) {
                return voided();
            }

            try {
                await this.save();
                return voided();
            } catch (e) {
                return coerceError(e);
            }
        }

        const index = this.#document!.secrets.findIndex((s) => s.name === name);

        if (properties.value !== undefined && properties.value !== existing.value) {
            const record: SecretRecord = {
                name: name,
                value: properties.value ?? "",
                version: crypto.randomUUID(),
                createdAt: new Date(),
                enabled: properties.enabled ?? true,
            };

            if (properties.tags) {
                record.tags = properties.tags;
            }

            if (properties.expiresAt) {
                record.expiresAt = properties.expiresAt;
            }

            this.#document!.secrets[index] = record;
            const hist = this.#document!.history[name] ?? [];
            hist.push(existing);

            if (!this.#params.autoSave) {
                return voided();
            }

            try {
                await this.save();
                return voided();
            } catch (e) {
                return coerceError(e);
            }
        }

        for (const key in properties) {
            if (key === "value") {
                continue;
            }

            existing[key] = properties[key];
        }

        if (!this.#params.autoSave) {
            return voided();
        }

        try {
            await this.save();
            return voided();
        } catch (e) {
            return coerceError(e);
        }
    }

    save(): Promise<void> {
        return this.#slim.then(async () => {
            const doc = this.#document ?? {
                name: this.#params.name,
                secrets: [],
                history: {},
            };

            const content = this.#serializer!.serialize(doc);
            let { file, config } = this.#params;
            let c = this.#params.cwd;

            if (!isAbsolute(file)) {
                if (c) {
                    this.#params.file = resolve(c, file);
                } else {
                    this.#params.file = resolve(file);
                }

                file = this.#params.file;
            }

            if (config && !isAbsolute(config)) {
                if (c) {
                    config = resolve(c, config);
                } else {
                    config = resolve(config);
                }

                this.#params.config = config;
            }

            const backup = await readTextFile(file);

            try {
                await writeTextFile(this.#params.file, content);

                if (!this.#serializer === undefined) {
                    switch (this.#ext) {
                        case ".env":
                            {
                                const { serializer } = await import("./serializers/dotenv.ts") as {
                                    serializer: DocumentSerializer;
                                };
                                this.#serializer = serializer;
                            }
                            break;

                        case ".json":
                            {
                                const { serializer } = await import("./serializers/json.ts") as {
                                    serializer: DocumentSerializer;
                                };
                                this.#serializer = serializer;
                            }
                            break;
                        case ".yaml":
                        case ".yml":
                            {
                                const { serializer } = await import("./serializers/yaml.ts") as {
                                    serializer: DocumentSerializer;
                                };
                                this.#serializer = serializer;
                            }
                            break;
                        default:
                            throw new Error(
                                "Unsupported file extension for SpawnSopsClient " + this.#ext,
                            );
                    }
                }

                const { age, vault, gcp, aws, pgp, azure } = this.#params;
                const splat: string[] = ["decrypt"];
                const vars: Record<string, string> = {};

                if (this.#params.config) {
                    splat.push("--config", this.#params.config);
                }

                if (!c) {
                    c = dirname(file);
                }

                if (age) {
                    if (age.recipients) {
                        splat.push("--age", age.recipients);
                    }

                    if (age.keyFile) {
                        vars["SOPS_AGE_KEY_FILE"] = age.keyFile;
                    }

                    if (age.key) {
                        vars["SOPS_AGE_KEY"] = age.key;
                    }
                }

                if (azure && azure.uri) {
                    splat.push("--azure-kv", azure.uri);
                }

                if (vault && vault.uri) {
                    splat.push("--hc-vault-transit", vault.uri);
                }

                if (gcp && gcp.uri) {
                    splat.push("--gcp-kms", gcp.uri);
                }

                if (aws && aws.arns) {
                    splat.push("--kms", aws.arns);
                }

                if (pgp && pgp.fingerprints) {
                    splat.push("--pgp", pgp.fingerprints);
                }

                splat.push("--in-place", file);

                const out = await sops(splat, {
                    env: vars,
                    cwd: c,
                }).output();

                if (out.code !== 0) {
                    throw new Error(
                        `Failed to save document, you will need to encrypt ${file} before commiting it: `,
                    );
                }
            } catch (e) {
                const tmp = await makeTempFile({ prefix: "sops", suffix: ".env" });
                writeTextFile(tmp, backup);
                writeTextFile(file, backup);
                throw new Error(
                    `Failed to save the vault. The previous content has been restored to ${tmp}.`,
                    { cause: e },
                );
            }
        });
    }

    async load(): Promise<void> {
        if (this.#loaded) {
            return;
        }

        return await this.#slim.then(async () => {
            if (!this.#serializer === undefined) {
                switch (this.#ext) {
                    case ".env":
                        {
                            const { serializer } = await import("./serializers/dotenv.ts") as {
                                serializer: DocumentSerializer;
                            };
                            this.#serializer = serializer;
                        }
                        break;

                    case ".json":
                        {
                            const { serializer } = await import("./serializers/json.ts") as {
                                serializer: DocumentSerializer;
                            };
                            this.#serializer = serializer;
                        }
                        break;
                    case ".yaml":
                    case ".yml":
                        {
                            const { serializer } = await import("./serializers/yaml.ts") as {
                                serializer: DocumentSerializer;
                            };
                            this.#serializer = serializer;
                        }
                        break;
                    default:
                        throw new Error(
                            "Unsupported file extension for SpawnSopsClient " + this.#ext,
                        );
                }
            }

            let { file, config } = this.#params;
            let c = this.#params.cwd;

            if (!isAbsolute(file)) {
                if (c) {
                    this.#params.file = resolve(c, file);
                } else {
                    this.#params.file = resolve(file);
                }

                file = this.#params.file;
            }

            if (config && !isAbsolute(config)) {
                if (c) {
                    config = resolve(c, config);
                } else {
                    config = resolve(config);
                }

                this.#params.config = config;
            }

            // file does not exist, create a new document
            if (!await exists(file)) {
                this.#document = {
                    name: this.#params.name,
                    secrets: [],
                    history: {},
                };

                return;
            }

            const { age } = this.#params;
            const splat: string[] = ["decrypt"];
            const vars: Record<string, string> = {};

            if (this.#params.config) {
                splat.push("--config", this.#params.config);
            }

            if (!c) {
                c = dirname(file);
            }

            if (age) {
                if (age.keyFile) {
                    vars["SOPS_AGE_KEY_FILE"] = age.keyFile;
                }

                if (age.key) {
                    vars["SOPS_AGE_KEY"] = age.key;
                }
            }

            const out = await sops(splat, {
                env: vars,
                cwd: c,
            }).output();

            if (out.code !== 0) {
                throw new Error("Failed to load document: " + out.stderr);
            }

            const content = out.text();
            this.#document = this.#serializer!.deserialize(content);
        });
    }
}
