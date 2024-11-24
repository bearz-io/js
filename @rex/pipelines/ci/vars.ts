import { writer } from "./writer.ts";
import { CI_DRIVER } from "./driver.ts";
import { env } from "@bearz/env";
import { readTextFileSync, writeTextFileSync } from "@bearz/fs";

export function setPipelineVar(
    name: string,
    value: string,
    options?: { secret?: boolean; output?: boolean },
): void {
    switch (CI_DRIVER) {
        case "github":
            {
                writer.debug("Update GITHUB_ENV with %s", name);
                env.set(name, value);
                if (options?.secret) {
                    writer.writeLine(`::add-mask::${value}`);
                }
                const file = env.get("GITHUB_ENV");
                if (!file) {
                    writer.debug("GITHUB_ENV not set");
                    return;
                }
                let content = readTextFileSync(file);

                if (value.includes("\n")) {
                    content += `${name}<<EOF\n${value}\nEOF\n`;
                } else {
                    content += `${name}=${value}\n`;
                }

                writeTextFileSync(file, content);

                if (options?.output) {
                    const file = env.get("GITHUB_OUTPUT");
                    if (!file) {
                        writer.debug("GITHUB_OUTPUT not set");
                        return;
                    }

                    let content = readTextFileSync(file);
                    if (value.includes("\n")) {
                        content += `${name}<<EOF\n${value}\nEOF\n`;
                    } else {
                        content += `${name}=${value}\n`;
                    }

                    writeTextFileSync(file, content);
                }
            }
            break;
        case "azdo":
            {
                env.set(name, value);
                let attr = "";
                if (options?.secret) {
                    attr += ";issecret=true";
                }
                if (options?.output) {
                    if (attr) {
                        attr += ",";
                    } else {
                        attr += ";";
                    }
                    attr += "isoutput=true";
                }

                writer.debug("Update Azure Devops variable with %s%s", name, attr);

                writer.writeLine(`##vso[task.setvariable variable=${name}${attr}]${value}`);
            }
            break;
        case "local":
            break;
        default:
            env.set(name, value);
    }
}
