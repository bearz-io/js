# @spawn/sudo

## Overview

The sudo module  provides a simple way to execute
sudo commands.

The module relies upon the [@bearz/exec][exec] module and
has the same basic ussops as the `Command` and `ShellCommand` class.

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@spawn/sudo/doc)

## Usage
```typescript
import { sudo } from '@spawn/sudo'
import { cmd } from '@bearz/exec'

// outputs directly to stdout and stderror streams.
await sudo("-h").run();

// pipes the output
const result = await sudo("-h");
console.log(result.stdout);
console.log(result.text());
console.log(result.code);

// run a command
const result2 = await sudo(cmd("ls", "-l"));
console.log(result2.stdout);
console.log(result2.text());
console.log(result2.code);

// or run a command using args
const result3 = await sudo("ls", "-l");
console.log(result3.stdout);
console.log(result3.text());
console.log(result3.code);
```

## License

[MIT License](./LICENSE.md)

[exec]: https://jsr.io/@gnome/exec/doc