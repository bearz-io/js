# @spawn/az

The az module wraps the az cli. [@bearz/exec](https://jsr.io/@bearz/exec)
powers this module.

```typescript
import { az } from '@spawn/az'

// outputs directly to stdout and stderror streams.
await az("-h").run();

// pipes the output
const result = await az("-h");
console.log(result.stdout);
console.log(result.text());
console.log(result.code);
```

## License

[MIT](./LICENSE.md)
