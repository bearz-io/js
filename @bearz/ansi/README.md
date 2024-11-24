# @bearz/ansi

The `ansi` module provides color detection, writing ansi
codes, and an ansi writer. 

The core ansi functions in the styles module comes from
Deno's `@std/fmt/color` but adds some enhancements to make
it less dependant on Deno. 

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@bearz/ansi/doc)

## Usage
```typescript
import { blue, writer, bgBlue, green, bold, apply } from "@bearz/ansi";

writer.write("Hello, World!").writeLine();
writer.debug("Hello, World!");
writer.info("Hello, World!");
writer.success("Hello, World!");
writer.writeLine(apply("Hello, World!", bold, green, bgBlue) + " test");
writer.styleLine("Hello, World", bold, green);
writer.info("An informational message");
writer.writeLine(blue("My message"));
writer.writeLine(apply("Multiple Styles", bgBlue, bold));
```

## License

[MIT License](./LICENSE.md) and code from other sources
are detailed in the [License File](./LICENSE.md)

The ansi code is from deno's `@std/fmt/color`