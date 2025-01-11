import type { DocumentSerializer, VaultDocument } from "../types.ts";
import { parse, stringify } from "yaml";

export class JsonSerializer implements DocumentSerializer {
    serialize(document: VaultDocument): string {
        const serialized = document.secrets.filter((s) =>
            s.value !== undefined && s.value.length > 0
        ).reduce((acc, secret) => {
            acc[secret.name] = secret.value!;
            return acc;
        }, {} as Record<string, string>);
        return stringify(serialized, null, 4);
    }

    deserialize(serialized: string): VaultDocument {
        const data = parse(serialized) as unknown;
        if (
            data === undefined || data === null || typeof data !== "object" || Array.isArray(data)
        ) {
            return {
                name: "json",
                secrets: [],
                history: {},
            };
        }

        const obj = data as Record<string, unknown>;

        if (!obj.secrets || !Array.isArray(obj.secrets)) {
            return {
                name: "json",
                secrets: [],
                history: {},
            };
        }

        if (!obj.name) {
            obj.name = "json";
        }

        return obj as unknown as VaultDocument;
    }
}

export const serializer = new JsonSerializer();
