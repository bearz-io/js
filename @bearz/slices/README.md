# @bearz/slices


## Overview

Slices enable working with slices of an array without resizing or
creating new arrays in most cases.  Instead, new slices are
created that that allows one to work with a segment of the
array.

They are not as effecient as go's `slice` or .NET's `Span<T>`, but
they do provide some benefits for dealing with smaller segments
of arrays or character slices.

The CharSlice and ReadOnlyCharSlice are specialized slice types
for working with string characters in their uint32 codepoint format
and provide string like methods such as trim, indexof, toUpper,
toLower, includes, and more without the need to convert them
back into strings to perform those operations.

The CharSlice and ReadOnlyCharSlice allow you to work with
strings without allocating multiple copies of immuatable strings
and allow you to make multiple transforms  before
converting back to a string.  

The case insensitive formats of methods end with "Fold" which
are based upon go's `SimpleFold` and `EqualFold` methods. For
example: `equalFold`, `startsWithFold`, `endsWithFold`, `indexOfFold`
perform case insensitive comparisons over strings or CharSliceLike
objects such as CharSlice or Uint32Arrays.

## Basic Usage

```typescript
import * from slices from '@bearz/slices'

console.log(slices.equalIgnoreCase("left", "LeFT")); // true
console.log(slices.trimEnd("my random text...", ".")); // my random text
console.log(slices.underscore("first-place")); // first_place


var sb = new slices.CharArrayBuilder()
sb.append("test")
   .append(new TextEncoder().encode(": another test"));

// faster
sb.appendString("test")
  .appendUtf8Array(new TextEncoder().encode(": another test"))

console.log(sb.toString())
```

## LICENSE

[MIT License](./LICENSE.md)