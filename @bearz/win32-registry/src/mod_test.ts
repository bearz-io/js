import { Registry } from "./mod.ts";
import { equal, exists, ok, throws } from "@bearz/assert";
import { skip } from "@bearz/assert/skip";
import { isDebug } from "@bearz/testing";
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
    if (isDebug()) {
        console.log(names);
    }
});

test("win32-registry::Key.getString", skip(!WINDOWS), () => {
    using key = Registry.HKCU.openKey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes");
    exists(key);
    const theme = key.getString("CurrentTheme");
    ok(theme.length > 0);
    if (isDebug()) {
        console.log(theme);
    }
});

test("win32-registry::Key.getInt32", skip(!WINDOWS), () => {
    using key = Registry.HKCU.openKey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes");
    exists(key);
    const value = key.getInt32("ThemeChangesDesktopIcons");
    exists(value);
    if (isDebug())
        console.log(value);
});

test("win32-registry::Key.getValueNames", skip(!WINDOWS), () => {
    using key = Registry.HKCU.openKey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes");
    exists(key);
    const names = key.getValueNames();
    exists(names);
    ok(names.length > 0);
    ok(names.includes("CurrentTheme"));
    
    if (isDebug())
        console.log(names);
});

test("win32-registry::Key.createKey", skip(!WINDOWS), () => {
    using key = Registry.HKCU.createKey("BEARZ_TEST_KEY");
    exists(key);
    equal(key.created, true);
    equal("HKCU\\BEARZ_TEST_KEY", key.path);

    if (isDebug())
        console.log(key);
    const res = Registry.HKCU.deleteKey("BEARZ_TEST_KEY");
    ok(res);
});

test("win32-registry::Key - test setting values", skip(!WINDOWS), () => {
    using key = Registry.HKCU.createKey("BEARZ_TEST_VALUES");
    try {
        key.setString("Tick", "Spoon");
        const value = key.getString("Tick");
        equal("Spoon", value);

        key.setInt32("Age", 200);
        const age = key.getInt32("Age");
        equal(age, 200);

        key.setInt64("Age3", 12312412n);
        const age3 = key.getInt64("Age3");
        equal(age3, 12312412n);

        const text = new TextEncoder().encode("Hello");
        key.setBinary("binary", text);

        equal(key.getBinary("binary"), text);

        const values = ["first", "second", "third"];
        key.setMultiString("m", values);
        const mt = key.getMultiString("m");
        equal(mt, values);

        key.deleteValue("m");
        throws(() => {
            key.getMultiString("m");
        });
    } finally {
        Registry.HKCU.deleteKey("BEARZ_TEST_VALUES");
    }
});
