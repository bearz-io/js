import { Registry } from "./mod.ts";
import { exists } from "@bearz/assert";
import { skip } from "@bearz/assert/skip"
import { WINDOWS } from "@bearz/runtime-info/os"


const test = Deno.test; 

test("win32-registry::Registry does not throw", skip(!WINDOWS), () => {
    using key = Registry.HKCU.openKey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion");
    exists(key);
    for(const value of key.getSubKeyNames()) {
        console.log(value);
    }

    using k2 = Registry.HKCU.openKey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes")
    exists(key)
    const v = k2.getString("CurrentTheme");
    console.log(v);
    exists(key);
});