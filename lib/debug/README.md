# @gnome/debug

<div height=30" vertical-align="top">
<image src="https://raw.githubusercontent.com/gnomejs/gnomejs/main/assets/icon.png"
    alt="logo" width="60" valign="middle" />
<span>Work less. Do more. </span>
</div>

## Overview

A runtime agnostic implementation writing debug statements
in library code without the need for a logging framework
or library. Similary to Rust's `std:dbg`, .Net's `System.Diagnostics.Debug`,
etc.

Unfortunately because JavaScript is not compiled, the statements
can not be removed from a library, so this module should be
used sparingly.

When it is used, you'll want to `isDebugEnabled` for avoid any
costly calls that require extra processing before writing out
a debug stream statement.

## Basic Usage

```ts
import { isDebugEnabled, setDebugEnabled, assert, writeLine, writeLineIf } from "@gnome/debug"

setDebugEnabled(true);

try {
    // some low level call
} catch(e) {
    if (isDebugEnabled() && e.stack) {
        writeLine(e.stack)
    }
}

let x = 5;
// perform some logic

if (isDebugEnabled())
    assert(x >= 5, "x must be 5 or greater");


if (isDebugEnabled())
    writeLineIf(x < 5, `x was ${x}`);

```

## See also

[MIT License](./LICENSE.md)
[CHANGELOG](./CHANGELOG.md)
