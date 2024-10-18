import { equal, exists } from "@bearz/assert";
import { RUNTIME } from "./js.ts";
import {
    ARCH,
    DARWIN,
    DEV_NULL,
    DIR_SEP,
    DIR_SEP_RE,
    EOL,
    IS_64BIT,
    LINUX,
    PATH_SEP,
    PLATFORM,
    WINDOWS,
} from "./os.ts";

// DO NOT REMOVE
// This line is used by automation to convert to vitest
const test = Deno.test;

const g = globalThis as Record<string, unknown>;

test("runtime-info::os", () => {
    exists(PLATFORM);
    exists(ARCH);
    exists(IS_64BIT);
    switch (RUNTIME) {
        case "bun":
        case "node":
            {
                const process = g.process as Record<string, unknown>;
                let platform = process.platform as string;
                if (platform === "win32") {
                    platform = "windows";
                }
                equal(PLATFORM, platform);
            }
            return;
        case "deno":
            {
                const deno = g.Deno as Record<string, unknown>;
                const build = deno.build as Record<string, unknown>;
                const platform = build.os as string;
                equal(PLATFORM, platform);
            }
            break;

        case "browser":
            exists(PLATFORM);
            return;
        case "cloudflare":
            equal(PLATFORM, "linux");
            return;
        default:
            equal(PLATFORM, "unknown");
            return;
    }

    switch (PLATFORM) {
        case "windows":
            equal(WINDOWS, true);
            equal(PATH_SEP, ";");
            equal(DIR_SEP, "\\");
            equal(DIR_SEP_RE, /[\\/]+/);
            equal(EOL, "\r\n");
            equal(DEV_NULL, "NUL");
            break;
        case "linux":
            equal(LINUX, true);
            equal(PATH_SEP, ":");
            equal(DIR_SEP, "/");
            equal(DIR_SEP_RE, /\/+/);
            equal(EOL, "\n");
            equal(DEV_NULL, "/dev/null");

            break;
        case "darwin":
            equal(DARWIN, true);
            equal(PATH_SEP, ":");
            equal(DIR_SEP, "/");
            equal(DIR_SEP_RE, /\/+/);
            equal(EOL, "\n");
            equal(DEV_NULL, "/dev/null");
            break;
        default:
            equal(PATH_SEP, ":");
            equal(DIR_SEP, "/");
            equal(DIR_SEP_RE, /\/+/);
            equal(EOL, "\n");
            equal(DEV_NULL, "/dev/null");
            break;
    }
});
