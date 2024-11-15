import { env } from "@bearz/env";
import { CI, CI_DRIVER } from "./driver.ts";
import { type SecretMasker, secretMasker } from "@bearz/secrets";
import { stringify } from "@bearz/dotenv";
import { writeTextFileSync } from "@bearz/fs";

let outputVar = "BEARZ_CI_OUTPUT";
let envVar = "BEARZ_CI_ENV";
let pathVar = "BEARZ_CI_PATH";
let secretsVar = "BEARZ_CI_SECRETS";

if (CI_DRIVER === "github") {
    outputVar = "GITHUB_OUTPUT";
    envVar = "GITHUB_ENV";
    pathVar = "GITHUB_PATH";
}

let sm: SecretMasker = secretMasker;
/**
 * Options for setting CI environment variable
 * names for the output, env, path, and secrets files.
 */
export interface CiEnvKeys {
    /**
     * The name of the environment variable that
     * contains the path for the output vars file.
     * Defaults to `BEARZ_CI_OUTPUT`.
     */
    output?: string;
    /**
     * The name of the environment variable that
     * contains the path for the env vars file.
     * Defaults to `BEARZ_CI_ENV`.
     */
    env?: string;
    /**
     * The name of the environment variable that
     * contains the path for the path vars file.
     * Defaults to `BEARZ_CI_PATH`.
     */
    path?: string;
    /**
     * The name of the environment variable that
     * contains the path for the secrets vars file.
     * Defaults to `BEARZ_CI_SECRETS`.
     */
    secrets?: string;
}

/**
 * Sets the global secret masker for the ci-env module.
 * @param s The secret masker to use.
 */
export function setSecretMasker(s: SecretMasker): void {
    sm = s;
}

/**
 * Sets the name of the environment variables to use
 * for the output, env, path, and secrets variables
 * that map to files that temporarily store the
 * values between steps/tasks.
 * @param o The options to set the environment variable names.
 */
export function setCiEnvKeys(o: CiEnvKeys): void {
    if (CI_DRIVER === "github") {
        return;
    }

    if (o.output !== undefined) {
        outputVar = o.output;
    }

    if (o.env !== undefined) {
        envVar = o.env;
    }

    if (o.path !== undefined) {
        pathVar = o.path;
    }

    if (o.secrets !== undefined) {
        secretsVar = o.secrets;
    }
}

/**
 * The options for setting a CI variable.
 */
export interface CiVariableOptions {
    /**
     * Treat the value as a secret.
     */
    secret?: boolean;
    /**
     * Treat the value as output.
     */
    output?: boolean;
}

/**
 * Prepends a path to the CI path.
 * @param value The path to prepend to the CI path.
 */
export function prependCiPath(value: string): void {
    if (!env.has(value)) {
        env.path.prepend(value);
    }

    switch (CI_DRIVER) {
        case "azdo":
            console.log(`##vso[task.prependpath]${value}`);
            break;
        case "github":
            {
                const pathFile = env.get(pathVar);
                if (pathFile) {
                    writeTextFileSync(pathFile, `${value}\n`, { append: true });
                }
            }
            break;
        default:
            {
                const pathFile = env.get(pathVar);
                if (pathFile) {
                    writeTextFileSync(pathFile, `${value}\n`, { append: true });
                }
            }
            break;
    }
}

/**
 * Sets a variable in the CI environment. Generally variables
 * are environment variables that configured by a task to
 * persist between steps.
 * @param name The name of the CI variable.
 * @param value The value of the CI variable.
 * @param options The options for the CI variable.
 * @returns void
 */
export function setCiVariable(name: string, value: string, options?: CiVariableOptions): void {
    if (CI) {
        env.set(name, value);
    }

    if (options?.secret) {
        sm.add(value);
    }

    switch (CI_DRIVER) {
        case "azdo":
            {
                let attr = "";
                if (options?.secret) {
                    attr = ";issecret=true";
                }
                if (options?.output) {
                    attr = ";isoutput=true";
                }

                console.log(`##vso[task.setvariable variable=${name}${attr}]${value}`);
            }

            break;
        case "github":
            {
                if (options?.secret) {
                    console.log("::add-mask::" + value);
                }
                const envFile = env.get(envVar);

                if (envFile) {
                    if (value.includes("\n")) {
                        writeTextFileSync(envFile, `${name}<<EOF\n${value}\nEOF\n`, {
                            append: true,
                        });
                    } else {
                        writeTextFileSync(envFile, `${name}=${value}\n`, { append: true });
                    }
                }

                if (!options?.output) {
                    return;
                }

                const outputFile = env.get(outputVar);
                if (outputFile) {
                    if (value.includes("\n")) {
                        writeTextFileSync(outputFile, `${name}<<EOF\n${value}\nEOF\n`, {
                            append: true,
                        });
                    } else {
                        writeTextFileSync(outputFile, `${name}=${value}\n`, { append: true });
                    }
                }
            }
            break;
        default:
            {
                const envFile = env.get(envVar);
                const outputFile = env.get(outputVar);
                const data: Record<string, string> = { [name]: value };
                const content = stringify(data);
                if (envFile) {
                    writeTextFileSync(envFile, content, { append: true });
                }
                if (options?.output) {
                    if (outputFile) {
                        writeTextFileSync(outputFile, content, { append: true });
                    }
                }

                if (!options?.secret || !CI) {
                    return;
                }

                const secretsFile = env.get(secretsVar);
                if (secretsFile) {
                    writeTextFileSync(secretsFile, `${name}=${value}\n`, { append: true });
                }
            }

            break;
    }
}
