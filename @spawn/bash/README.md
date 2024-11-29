# @spawn/bash

## Overview

The `bash` module provides a simple way to execute
bash scripts or files.

The module relies upon the [@bearz/exec][exec] module and
has the same basic usage as the `Command` and `ShellCommand` class.

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@spawn/bash/doc)

## Usage

```typescript
import { bashScript, bash } from "@spawn/bash";

const cmd = await bashScript("echo 'Hello, World!'");
console.log(cmd.text());
console.log(cmd.code);

console.log(await bashScript("echo 'Hello, World!'").text());
console.log(await bashScript("test.sh").text()); 

// runs bash command and writes directly to console
await bashScript("echo 'I am alive'").run();

await bash(["-e", "path/to/file.sh"]).run();
```

## License

[MIT License](./LICENSE.md)

[exec]: https://jsr.io/@bearz/exec/doc