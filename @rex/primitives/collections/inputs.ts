import { ObjectMap } from "./object_map.ts";

export class Inputs extends ObjectMap {
    static fromObject(obj: Record<string, unknown>): Inputs {
        const map = new Inputs();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key, value);
        }
        return map;
    }
}
