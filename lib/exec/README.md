# @bearz/exec

## Overview

The exec module provides cross-runtime functionality for invoke
executables.  A unified API is created for deno, node, bun
to executables such as but not limited to git, which, echo, etc.

The API is influenced by deno, bun, go's api with some ehancements
such as providing `which` and `whichSync` and converting string or objects
into an array of arguments for the excutable.

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@bearz/exec/doc)

## Usage
```typescript
import { Command, cmd, run, output, type SplatObject, which } from "@gnome/exec";

// string, array, or objects can be used for "args".
const cmd1 = new Command("git", "show-ref master", {
    env: { "MY_VAR": "TEST" },
    cwd: "../parent"
});
const output = await cmd1.output();

console.log(output); // ->
// {
//    code: 0,
//    signal: undefined,
//    success: true
//    stdout: Uint8Array([01, 12..])
//    stderr: Uint8Array([0])
// }

// the output result has different methods on it..
console.log(output.text()) // text
console.log(output.lines()) // string[]
console.log(output.json()) // will throw if output is not valid json

const cmd2 = cmd("git", "show-ref master");

// these are the same.
console.log(await cmd2.output()) 
console.log(await cmd2); 
console.log(await new Command("git", "show-ref master"));

console.log(await cmd2.text()); // get only the text from stdout instead

// pipe commands together
const result = cmd("echo", ["my test"])
    .pipe("grep", ["test"])
    .pipe("cat")
    .output();

console.log(result.code);
console.log(result.stdout);

// output is the short hand for new Command().output()
// and output defaults stdout and stderr to 'piped'
// which returns the stdout and stderr streams a as Uint8Array
const text = await output("git", ["show-ref", "master"]).then(o => o.text())
console.log(text);

```

## License

[MIT License](./LICENSE.md)