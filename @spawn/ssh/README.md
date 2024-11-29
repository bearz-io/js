# @spawn/ssh

## Overview

The `ssh` module provides a simple way to execute
ssh commands.

The module relies upon the [@bearz/exec][exec] module and
has the same basic usage as the `Command` class.

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@spawn/ssh/doc)

## Usage
```typescript
import { ssh } from "@spawn/ssh";

await ssh(["user@host", "ls"]).run(); 
```

## Notes

Executing native ssh by spawning child processes works well with 
identities (ssh keys) configured with ssh-agent and certain
option flags.  

When using passwords, its better to something like the
npm:ssh2 library. The Ssh executables will always write
to /dev/tty for certain things like prompting for 
passwords or accepting certificates from the host.  That means
you cannot intercept the prompt even when stdout is `piped` 
unless you call other executables like ssh-askpass or expect.  

It may be possible to handle passwords with later versions
of SSH by creating a script and using the `SSH_ASKPASS` env
variable.

## License

[MIT License](./LICENSE.md)

[exec]: https://jsr.io/@bearz/exec/doc