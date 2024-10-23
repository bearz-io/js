# @bearz/chars

<div height=30" vertical-align="top">
<image src="https://raw.githubusercontent.com/gnomejs/gnomejs/main/assets/icon.png"
    alt="logo" width="60" valign="middle" />
<span>Work less. Do more. </span>
</div>

## Overview

The chars module contains character related functions commonly
found in other standard libraries or frameworks such as `isSpace`,
`isLetter`, `isUpper`, `isDigit`, etc.

The module will handle characters outside latin and ascii such as
Cyrillic or Greek characters.

The char module provides functions common character functions:

- `equalFold`
- `isAscii`
- `isChar`
- `isControl`
- `isDigit`
- `isLatin`
- `isLetterOrDigit`
- `isLetter`
- `isLower`
- `isPunc`
- `isSpace`
- `isSymbol`
- `isUpper`
- `simpleFold`
- `toLower`
- `toUpper`

## Basic Usage

```typescript
import { 
    isUpperAt, 
    isLowerAt, 
    isDigit, 
    isAscii, 
    isLatin1, 
    isSpaceAt,
    equalFold
} from "@bearz/chars";

const str = "Hello, World 123";
console.log(isUpperAt(str, 0)); // true
console.log(isUpperAt(str, 1)); // false
console.log(isLowerAt(str, 1)); // false
console.log(isDigit(str, 1)); // false 
console.log(isDigit(str, 14)); // true

const left = "Ꙏ".codePointAt(0)
const right = "ꙏ".codePointAt(0)
console.log(equalFold(left, right)); // true

console.log(isAsciiAt("⇼", 0)); // false
console.log(isAsciiAt(str, 0)); // true
console.log(isLatin1At("⇼", 0)); // false

const str2 = " \n\r\t\f"
console.log(isSpaceAt(str2, 0)); // true
console.log(isSpaceAt(str2, 1)); // true
console.log(isSpaceAt(str2, 2)); // true
console.log(isSpaceAt(str2, 3)); // true
```

## Notes

The overall goal for the char module to enable inspecting
characters and avoid string allocations where possible.

## License

[MIT License](./LICENSE.md) and the BSD style License
from [go](https://go.dev/LICENSE) as the updated version
of this library is adapted from go's unicode package.
