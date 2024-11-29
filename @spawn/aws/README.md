# @spawn/aws

The aws module wraps the aws cli. [@bearz/exec](https://jsr.io/@bearz/exec)
powers this module.

```typescript
import { aws } from '@spawn/aws'

// outputs directly to stdout and stderror streams.
await aws("help").run();

// pipes the output
const result = await aws("help");
console.log(result.stdout);
console.log(result.text());
console.log(result.code);
```

## License

[MIT](./LICENSE.md)
