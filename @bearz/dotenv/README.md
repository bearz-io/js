# @bearz/dotenv

# Overview

A dotenv module that can parse .env files into a document, 
or normal object, expand variables, and stringify documents
or objects into a .env content.

This module does not load documents from files and that
is by design to avoid taking a fs module dependency so that
the module can be used in the brower similar to JSON, or yaml
modules. 

The parseDocument and stringifyDocument methods exists enable
control over modifying and managing dotenv content, including
preseving comments and newlines when writing a .env to string

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@bearz/dotenv/doc)

## Usage
```typescript
import { parse, parseDocument, stringify, expand, load } from "@bearz/dotenv";

const content = `
# your comment

FOO="bar"
test='test'
MY_HOME="${HOME:-/home}"`

// parse doc parses .env content and turns into 
// a document of tokens
const doc = parseDocument(content);
console.log(doc.length); // 5 items
console.log(doc.at(0)); // prints the comment token { 'kind': 'your comment' }
console.log(doc.at(1)); // { 'kind' : 'newline' }


const tokens = doc.toArray(); // gets all the tokens
console.log(tokens); // view all the tokens

const data = doc.toObject(); // gets only the key value pairs
console.log(data.FOO); //bar
console.log(data.MY_HOME); // "${HOME:-/home}"

// expand variables
const expanded = expand(data);
console.log(data.MY_HOME); // /home/user

const env  = parse(content);
console.log(env.FOO); // bar

// takes the variables, expands them, and sets 
// the environment variables in the current process
load(env); 

const g = globalThis as { Deno?: unknown, process?: unknown }

if (g.Deno) {
    // deno
    console.log(Deno.env.get("MY_HOME"));
} else if(g.process) {
    // node/bun
    console.log(process.env["MY_HOME"]);
}

```

## License

[MIT License](./LICENSE.md)