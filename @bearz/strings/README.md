# @bearz/strings

## Overview

The strings module provides case insenstive methods like `equalsIgnoreCase`,
`includesIgnoreCase`, `indexOfIgnoreCase`, `startsWithIgnoreCase`, and
`endsWithIgnoreCase` to avoid using string allocation by using comparisons with
toLowerCase/toUpperCase.

A `Utf8StringBuilder` and `StringBuilder` classes are included to avoid
uness unnecessary allocations for building text.

Trim methods that take other characters than whitespace for trimming a string.

## Basic Usage

```typescript
import * from str from '@bearz/strings'

console.log(str.equalIgnoreCase("left", "LeFT")); // true
console.log(str.trimEnd("my random text...", ".")); // my random text
console.log(str.underscore("first-place")); // first_place

// useful for FFI
var sb = new str.Utf8StringBuilder()
sb.append("test")
   .append(new TextEncoder().encode(": another test"));

// faster
sb.appendString("test")
  .appendUtf8Array(new TextEncoder().encode(": another test"))

console.log(sb.toString())
```

## LICENSE

[MIT License](./LICENSE.md) and additional MIT License for the
inflection code, see [License](./LICENSE.md) for details.
