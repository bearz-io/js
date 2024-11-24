# @bearz/process-elevated

## Overview

Determines if the current process is elevated.  The function
checks if the process is running as root on linux and Mac.  The
function will check to see if the process is elevated by Adminstrator
or a priveleged account.

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@bearz/process-elevated/doc)

## Usage
```typescript
import { proccessElevated } from "@bearz/process-elevated";

if (!processElevated()) {
    throw new Error("action requres sudo or admin rights");
}

```

## License

[MIT License](./LICENSE.md)