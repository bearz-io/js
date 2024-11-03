# @bearz/ci-env

ci-env module implements it's own `@bearz/ansi/writer` to enable
logging commands for Azure DevOps and Github.  

This module will evolve over time to enable using common ci environment
variables and make it easier to deal with secrets, environment variables
and outputs in ci pipelines.

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@bearz/ci-env/doc)

## Usage
```typescript
import {writer, CI, CI_DRIVER } from "@bearz/ci-env";

// if not using azure devops/github, the write falls back to using ansi codes.

writer.info("message");
writer.warn("warning"); // for azure devops/github this emits a warnning logging command
writer.error("test"); // for azure devops/github this emits a warnning logging command

// for azure devops/github this emits a commmand logging command. 
// this does not executing a command, but simply outputs it.  
writer.command("git", ["commit", "-a", "-m", "test") 

console.log(CI);  // outputs if running in a CI pipeline
console.log(CI_DRIVER); // outputs the CI Driver name. 

```

## License

[MIT License](./LICENSE.md)