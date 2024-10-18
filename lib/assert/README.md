# @bearz/assert

An assertion library that wraps the chai assertion library
and uses some of the Deno standard library's `@std/assert` module
to provide an opinionated set of assertions.
 
It is primarily used for testing for various bearz.io modules to make it
easier to write tests and switch between testing frameworks (deno test and vitest).

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@bearz/assert/doc)

## Usage
```typescript
import { equal, ok, nope } from "@bearz/assert";

equal(1, 1);
ok(true);
nope(false);
```

## License

[MIT License](./LICENSE.md)

is_error, unimplemented, rejects, and internal functions are from
the deno @std/assert module which is also MIT licensed.
https://jsr.io/@std/assert/1.0.6/LICENSE