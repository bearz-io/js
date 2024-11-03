# @bearz/env

## Overview

The env provides a uniform way to work with environment variables and
the path variable across different runtimes such as bun, node, deno,
cloudflare and the browser.  

Cloudflare and the brower uses an in memory store.

Bash and Windows style variable expansion is included. The env
object provides additional methods to convert values to boolean,
int, number, json, etc.  

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@bearz/env/doc)

## Usage
```typescript
import { env } from "@bearz/env";

// get values
console.log(env.get("USER") || env.get("USERNAME"));

// set variable
env.set("MY_VAR", "test")
console.log(env.get("MY_VAR"))

// expansion
env.expand("${MY_VAR}"); // test
env.expand("${NO_VALUE:-default}"); // default
console.log(env.get("NO_VALUE")); // undefined

env.expand("${NO_VALUE:=default}"); // default
console.log(env.get("NO_VALUE")); // default

env.set("TELEMETRY", "1")
console.log(env.getBool("TELEMTRY")); // true

env.getBool("TELEMETRY2"); // undefined
env.defaultBool("TELEMETRY2", false); // false

try {
    env.expand("${REQUIRED_VAR:?Environment variable REQUIRED_VAR is missing}");
} catch(e) {
    console.log(e.message); // Environment variable REQUIRED_VAR is missing 
}

// proxy object to allow get/set/delete similar to process.env
console.log(env.proxy.MY_VAR);
env.proxy.MY_VAR = "test"
console.log(env.proxy.MY_VAR)

// undefined will remove a value
env.merge({
    "VAR2": "VALUE",
    "MY_VAR": undefined
});

env.set("MY_VAR", "test")
env.remove("MY_VAR");

// append to the end of the environment path variables
env.path.append("/opt/test/bin");

// prepends the path
env.path.prepend("/opt/test2/bin");
env.path.has("/opt/test2/bin");

// removes the path. on windows this is case insensitive.
env.path.remove("/opt/test2/bin");

// replaces the path.
env.path.replace("/opt/test/bin", "/opt/test2/bin")

console.log(env.path.split()); 
console.log(env.path) // the full path string
console.log(env.path.toString()) // the full path string

const path = env.path.get()

// overwrites the environment's PATH variable
env.path.overwite(`${PATH}:/opt/test4/bin`) 
```

## License

[MIT License](./LICENSE.md)