import type { Env } from "../types.ts";
import { EnvBase } from "../base/mod.ts";

/**
 * Represents the environment variables and provides methods to interact with them.
 */
class MemoryEnv extends EnvBase {
    /**
     * Initializes a new instance of the `MemoryEnv` class.
     */
    constructor() {
        super();
    }
}

export const env: Env = new MemoryEnv();
