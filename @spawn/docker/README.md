# @spawn/docker

## Overview

The `docker` module provides a simple way to execute
docker commands.

The module relies upon the [@bearz/exec][exec] module and
has the same basic usage as the `Command` and `ShellCommand` class.

## Basic Usage

```typescript
import { docker } from "@spawn/docker";
 
await docker(["ps"]).run();

const result = await docker(["ps"]);
console.log(result.code);
console.log(result.text());
```

Import all available commands

```typescript
import * as docker from "@spawn/docker/commands";

await docker.inspect({ nameOrId: ["test"]});

```

[MIT License](./LICENSE.md)

[exec]: https://jsr.io/@bearz/exec/doc
