# @rex/vaults-sops-cli

## Overview

The sops vault store module that uses the sops cli to get or set secrets for rex.

Currently the module has only be tested with .env files using age.

## Documentation

Documentation is available on [jsr.io/@rex/vaults-sops-cli/doc](https://jsr.io/@rex/vaults-sops-cli/doc)

Documentation about the base dns module available on [jsr.io/@rex/vaults/doc](https://jsr.io/@rex/vaults/doc)

Documentation about the rex cli is available [jsr.io/@rex/cli/doc](https://jsr.io/@rex/cli/doc)

## Usage

The module is design to be primarily invoked by @rex/vaults module. However, the driver 
may be used directly as needed. 

```ts
import { SopsCliVault } from "@rex/vaults-sops-cli"

const vault = new SopsCliVault({
    name: "sops",
    config: "./etc/.sops.yaml",
    path: "./etc/secrets.env"
});

const secret = vault.getSecretValue("MY_SECRET");
console.log(secret);

```


[MIT License](./LICENSE.md)