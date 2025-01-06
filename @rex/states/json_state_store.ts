import type { StateDriverFactory, StateDriverParams, StateStore } from "./types.ts";
import { WINDOWS } from "@bearz/runtime-info";
import { env } from "@bearz/env";
import { dirname, join } from "@std/path";
import { exists, makeDir, readTextFile, writeTextFile } from "@bearz/fs";

export interface JsonStateStoreParams {
    name: string;
    path?: string;
    global?: boolean;
}

export class JsonStateStore implements StateStore {
    #params: JsonStateStoreParams;
    #slim: Promise<void>;
    #loaded = false;
    #data: Record<string, unknown> = {};
    #name: string;

    readonly driver = "file";

    constructor(params: JsonStateStoreParams) {
        this.#params = params;
        this.#slim = Promise.resolve();
        this.#name = this.#params.name;
        if (this.#params.name === "") {
            this.#params.name = "default";
        }

        if (!this.#params.path) {
            if (WINDOWS) {
                let dir = "";
                if (this.#params.global) {
                    dir = env.get("ALLUSERSPROFILE") ?? "c:\\ProgramData";
                    dir = join(dir, "rex", "states");
                } else {
                    dir = env.get("APPDATA") ?? "c:\\Users\\Public";
                    dir = join(dir, "rex", "states");
                }

                this.#params.path = join(dir, this.#params.name + ".json");
            } else {
                let dir = "";
                if (this.#params.global) {
                    dir = "/etc/rex/states";
                } else {
                    const tmp = env.get("XDG_CONFIG_HOME");
                    if (!tmp) {
                        const home = env.get("HOME");
                        if (!home) {
                            throw new Error("HOME environment variable not set");
                        }

                        dir = join(home, ".config", "rex", "states");
                    } else {
                        dir = join(tmp, "rex", "states");
                    }

                    this.#params.path = join(dir, this.#params.name + ".json");
                }
            }
        }
    }

    get name(): string {
        return this.#params.name;
    }

    async get<T = unknown>(path: string): Promise<T | undefined> {
        if (!this.#loaded) {
            await this.load();
        }

        return this.#data[path] as T | undefined;
    }

    async set<T = unknown>(path: string, value: T): Promise<void> {
        if (!this.#loaded) {
            await this.load();
        }

        this.#data[path] = value;
        await this.save();
    }

    async delete(path: string): Promise<void> {
        if (!this.#loaded) {
            await this.load();
        }

        delete this.#data[path];
        await this.save();
    }

    save(): Promise<void> {
        return this.#slim.then(async () => {
            const dir = dirname(this.#params.path!);
            if (!await exists(dir)) {
                await makeDir(dir, { recursive: true });
            }

            const content = JSON.stringify(this.#data, null, 4);
            await writeTextFile(this.#params.path!, content);
        });
    }

    async load(): Promise<void> {
        if (this.#loaded) {
            return;
        }

        this.#loaded = true;
        await this.#slim.then(async () => {
            if (!await exists(this.#params.path!)) {
                return;
            }

            const data = await readTextFile(this.#params.path!);
            this.#data = JSON.parse(data) as Record<string, unknown>;
        });
    }
}

export class JsonStateStoreFactory implements StateDriverFactory {
    canBuild(params: StateDriverParams): boolean {
        return (params.use !== undefined && params.use === "json" ||
            params.use === "@rex/states-json") ||
            (params.uri !== undefined && params.uri.startsWith("file:") &&
                params.uri.includes(".json"));
    }

    build(params: StateDriverParams): Promise<StateStore> {
        const { name, uri } = params;
        const w = params.with;

        let global = false;
        let path = "";

        if (w) {
            global = w.global as boolean ?? false;
            path = w.path as string ?? "";
        }

        if (uri) {
            const url = new URL(uri);
            const p = url.pathname;
            path = p;

            const g = url.searchParams.get("global");
            if (g && g === "true" || g === "1") {
                global = true;
            }
        }

        const p: JsonStateStoreParams = {
            name,
            path,
            global,
        };

        return Promise.resolve(new JsonStateStore(p));
    }
}

export const factory = new JsonStateStoreFactory();
