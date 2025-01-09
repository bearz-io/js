# @rex/dns-flarectl

## Overview

The cloudflare dns driver module that uses the flarectl cli to update
dns records. 

## Documentation

Documentation is available on [jsr.io/@rex/dns-flarectl/doc](https://jsr.io/@rex/dns-flarectl/doc)

Documentation about the base dns module available on [jsr.io/@rex/dns/doc](https://jsr.io/@rex/dns/doc)

Documentation about the rex cli is available [jsr.io/@rex/cli/doc](https://jsr.io/@rex/cli/doc)

## Usage

The module is design to be primarily invoked by @rex/dns module. However, the driver 
may be used directly as needed. 

```ts
import { FlareCtlDnsDriver } from "@rex/dns-flarectl"

const driver = new FlareCtlDnsDriver({
    name: "flarectl",
    apiToken: "<apiToken>"
});

await driver.setRecord("my.com", {
    name: "test1",
    type: "A",
    value: "10.0.1.2"
});

```


[MIT License](./LICENSE.md)