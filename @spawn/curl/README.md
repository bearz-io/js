# @spawn/curl

The curl module provides a simple way to execute curl commands.

The module relies upon the [@bearz/exec][exec] module and
has the same basic usage as the `Command` and `ShellCommand` class.

```typescript
import { curl } from '@spawn/curl'

// outputs directly to stdout and stderror streams.
await curl("-h").run();

// pipes the output
const result = await curl("-h");
console.log(result.stdout);
console.log(result.text());
console.log(result.code);

// captures the output and returns the text
const txt = await curl("https://icanhazip.com/").text();
console.log(txt);
```

## License

[MIT](./LICENSE.md)

[exec]: https://jsr.io/@bearz/exec/doc
