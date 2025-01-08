# @rex/tasks

## Overview

The rex tasks module contains the core functionality for defining 
and handling tasks. 

## Documentation

[rex.jolt9.com](rex.jolt9.com)

Code Documentation for the module available at [jsr](https://jsr.io/@rex/tasks/doc).


## Usage

```ts
import { task } from "@rex/tasks";
 
task("hello", (ctx) => {
    console.log("Hello");
});

// world depends on hello
task("world", ["hello"], (ctx) => {
   console.log("World");
});

task({
    id: "nurse"
    run: _ => {
        console.log("Hello nurse");
    }
})
.description("says hello nurse");

task("say", rex => console.log(`hello ${rex.env.get("NAME")}`))
    .description("says hello name");
    .env({"NAME": "test"})

task({
    id: "nurse"
    // this is a delegate that is late bound and will be resolved right before 
    // the task is run. 
    env: (c) => {
        const map = new StringMap();
        map.set("test", "test" + c.secrets.get("MySECRET"))
    }
    run: _ => {
        console.log("Hello nurse");
    }
});

task()

```


## License

[MIT License](./LICENSE.md)