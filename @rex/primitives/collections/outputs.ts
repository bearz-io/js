import { ObjectMap } from "./object_map.ts";

export class Outputs extends ObjectMap {
    static fromObject(obj: Record<string, unknown>): Outputs {
        const map = new Outputs();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key, value);
        }
        return map;
    }
}
