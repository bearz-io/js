import { Registry } from "./mod.ts";
import { exists, ok } from "@bearz/assert";
import { skip } from "@bearz/assert/skip";
import { WINDOWS } from "@bearz/runtime-info/os";

const test = Deno.test;

test("win32-registry::Registry.openKey", skip(!WINDOWS), () => {
    using key = Registry.HKCU.openKey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion");
    exists(key);
});

test("win32-registry::Key.getSubKeyNames", skip(!WINDOWS), () => {
    using key = Registry.HKCU.openKey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion");
    exists(key);
    const names = key.getSubKeyNames();
    exists(names);
    ok(names.length > 0);
    console.log(names);
});

test("win32-registry::Key.getString", skip(!WINDOWS), () => {
    using key = Registry.HKCU.openKey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes");
    exists(key);
    const theme = key.getString("CurrentTheme");
    ok(theme.length > 0);
    console.log(theme);
});

test("win32-registry::Key.getInt32", skip(!WINDOWS), () => {
    using key = Registry.HKCU.openKey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes");
    exists(key);
    const value = key.getInt32("ThemeChangesDesktopIcons");
    exists(value);
    console.log(value);
});
