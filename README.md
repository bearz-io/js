# Bearz.io JavaScript SDK

A software development kit for building applications and automations in typescript. Most of
the functionality supports bun, node, deno, and the browser.

> [!IMPORTANT]
> The @bearz, @spawn, @rex and other modules in this repository
> will be moving to individual repositories in the comming months.
>
> This repository will become a central location for notices
> and links to the various repositories.

This change is primarily to support better versioning, builds, and shipping
packages to both [jsr.io](jsr.io) and [npm](npmjs.com)

## @bearz repos

- [@bearz/ansi](https://github.com/bearz-io/js-ansi)
- [@bearz/assert](https://github.com/bearz-io/js-assert)
- [@bearz/chars](https://github.com/bearz-io/js-chars)
- [@bearz/ci-env](https://github.com/bearz-io/js-ci-env)
- [@bearz/dotenv](https://github.com/bearz-io/js-dotenv)
- [@bearz/env](https://github.com/bearz-io/js-env)
- [@bearz/exec](https://github.com/bearz-io/js-exec)
- [@bearz/fmt](https://github.com/bearz-io/js-fmt)
- [@bearz/option](https://github.com/bearz-io/js-option)
- [@bearz/path](https://github.com/bearz-io/js-path)
- [@bearz/process](https://github.com/bearz-io/js-process)
- [@bearz/result](https://github.com/bearz-io/js-result)
- [@bearz/runtime-info](https://github.com/bearz-io/js-runtimeinfo)
- [@bearz/slices](https://github.com/bearz-io/js-slices)
- [@bearz/strings](https://github.com/bearz-io/js-strings)
- [@bearz/testing](https://github.com/bearz-io/js-testing)


## Notes

Many of the modules listed above leverage libraries/packages from Deno's @std module code
and then modify them to support node/bun. Deno's @std libraries modules/packages
are only available on jsr.io and many of them still do not support node/bun despite
what it says on the module's support in jsr.

All the packages listed are both on jsr.io and npmjs.com.

Because of the lack of a std library that supports multiple JavaScript runtimes
and it will be years before one does, the bearz packages leverage
code from Deno and other libraries to enable support functionality today.

However, the goal is not to provide a 1-to-1 set of modules that matches Deno's
std library, only key functionality for automation and enable others to build
libraries that target the big 3 runtimes.  

Many of the libraries above exists to support the exec module and/or to enable
scripting and automation.  

Any libraries that leverage Foreign Function Interfaces (FFI) will be limited
to Deno/Bun for now as FFI is very messy on nodejs.  If nodejs ever ships a reasonable
built-in FFI module, then that will be supported.





