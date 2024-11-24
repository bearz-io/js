import type { ObjectMap } from "../collections/object_map.ts";
import type { Outputs } from "../collections/outputs.ts";
import type { ProxyMap } from "../collections/proxy_map.ts";
import type { StringMap } from "../collections/string_map.ts";
import type { RexWriter } from "../writer.ts";

export interface Context extends Record<string, unknown> {
    signal: AbortSignal;
    env: StringMap;
    variables: ObjectMap;
    writer: RexWriter;
    secrets: StringMap;
    services: ProxyMap<unknown>;
}

export interface ExecutionContext extends Context {
    outputs: Outputs;

    cwd: string;
}
