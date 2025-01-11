import type { DocumentSerializer, VaultDocument } from "../types.ts";
import { parse, stringify } from "@bearz/dotenv";

export class DotenvSerializer implements DocumentSerializer {
    serialize(document: VaultDocument): string {
        const serialized = document.secrets.filter((s) =>
            s.value !== undefined && s.value.length > 0
        ).reduce((acc, secret) => {
            acc[secret.name] = secret.value!;
            return acc;
        }, {} as Record<string, string>);
        return stringify(serialized);
    }

    deserialize(serialized: string): VaultDocument {
        const secrets = parse(serialized);
        const records = Object.entries(secrets).map(([name, value]) => ({
            name,
            value,
            type: "string",
        }));
        return {
            name: "dotenv",
            secrets: records,
            history: {},
        };
    }
}

export const serializer = new DotenvSerializer();
