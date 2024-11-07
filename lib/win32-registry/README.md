# @bearz/win32-registry

## Overview

Work with the Windows registry using Deno. The underlying implementation uses
foreign function interfaces to avoid using regedit or calling powershell.  

This module will load in all runtimes. It will throw when you call methods unless it
is executed from Deno and on a windows machine.

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@bearz/win32-registry/doc)

## Usage
```typescript
import { Registry } from "@bearz/win32-registry";
import { equal } from "@bearz/assert"

using key = Registry.HKCU.createKey("BEARZ_TEST_VALUES");
try {
    key.setString("Tick", "Spoon");
    const value = key.getString("Tick");
    equal("Spoon", value)

    key.setInt32("Age", 200);
    const age = key.getInt32("Age");
    equal(age, 200);

    key.setInt64("Age3", 12312412n);
    const age3 = key.getInt64("Age3");
    equal(age3, 12312412n)

    const text = new TextEncoder().encode("Hello");
    key.setBinary("binary", text);

    equal(key.getBinary("binary"), text);

    const values = ["first", "second", "third"];
    key.setMultiString("m", values);
    const mt = key.getMultiString("m");
    equal(mt, values);

    key.deleteValue("m");
    throws(() => {
        key.getMultiString("m")
    });

    console.log(key.getValueNames())

} finally {
    Registry.HKCU.deleteKey("BEARZ_TEST_VALUES")
}
// TODO: Write usage instructions here
```

## License

[MIT License](./LICENSE.md)