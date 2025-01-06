# @rex/vaults

## Overview

@rex/vaults provides tasks for registering vault stores and injecting
secrets into the execution context for running rex tasks so that they
can be used by other tasks. Secrets are put into both the `ctx.secrets` and `ctx.env`
properties.

`registerSecretVault` is used to make a vault store available to the execution context.
`registerSecrets` is used to import specific secrets into the execution context.

If you're using jobs or deployment targets, the tasks will be loaded in order. If you
are using task targets, you will need to assign the `registerSecretVault` and
`registerSecret` tasks as required dependencies.

## Documentation

Documentation is available on [jsr.io/@rex/vaults/doc](https://jsr.io/@rex/vaults/doc)

Documentation about the rex cli is available [jsr.io/@rex/cli/doc](https://jsr.io/@rex/cli/doc)

## Register Secret Vault

`registerSecretVault` will register a vault by name and driver type. If
the driver type has not been imported, it will be auto imported by registering
the vault factory responsible for creating vaults and making them globally available. 

If the driver type module does not exist, then the task will throw an error

When registering a secret vault that has complex configuration, it is best to use the
`use` and `with` properties.  For simple configurations, the `uri` property may be easier to use.


```ts
// rexfile.ts
import { registerSecretVault } from "@rex/vaults"

registerSecretVault({
    name: "default",  // used by registerSecrets to know which vault to pull from
    use: "sops-cli"
    with: {
        'driver': 'age',
        'file': "./etc/secrets.env"
        'config': "./etc/.sops.yaml",
        'age-key-file': "./etc/keys.txt",
    }
})

// or if you want to name the name to reference from other tasks, set the task id as
// the first parameters.
registerSecretVault("default-vault" {
    name: "default",  // used by registerSecrets to know which vault to pull from
    sops: "sops-cli",
    with: {
        'driver': 'age',
        'file': "./etc/secrets.env"
        'config': "./etc/.sops.yaml",
        'age-key-file': "./etc/keys.txt",
    }
})

```

### Secret vault registration params

```ts
export interface SecretVaultParams extends Record<string | symbol, unknown> {
    /**
     * The name of the vault. This is used to reference the vault in other tasks.
     */
    name: string;
    /**
     * The configuration uri for the vault. Configuration can be done with the `uri` or the
     * the `with` properties.  e.g.  `sops-cli:./etc/secrets.env?sops-config=./etc/.sops.yaml&age-key-file=./etc/keys.txt`
     * instructs the configuration to use the module `@rex/vaults-sops-cli` with file path of ./etc/secrets/env and
     * the parameters are key value pairs. 
     * 
     * Third-party modules will need to have the org in the protocol where the orgname is seperate with two hyphens:
     * `myorg--mymodule:./etc/secrets.env?sops-config=./etc/.sops.yaml&age-key-file=./etc/keys.txt`
     */
    uri?: string;
    /**
     * The name of the vault driver.  Rex modules can use shorthand names for drivers.
     * For example, the `@rex/vaults-sops-cli` module is mapped the shorthand name `sops-cli`.
     * 
     * Other 3rd party modules can be used by specifying the full import path where jsr is assumed 
     * to be the repository for the module.  For example, `@myorg/mymodule`.  The module must
     * have a ./factory sub-mobule that exports a factory instance. 
     */
    use?: string;
    /**
     * The configuration for the vault where each key is a configuration parameter. You will
     * need to refer to the documentation for the specific vault driver to determine the
     * the available configuration parameters.
     */
    with?: Record<string, unknown>;
}
```

## Register Secrets

Registering secrets will only pull the secrets that you define into the context as tasks are running.

```ts
// rexfile.ts
import { registerSecrets } from "@rex/vaults"
import { task } from "@rex/tasks"

registerSecrets([{
    name: "SECRET_ONE"
    // key: "SECRET_ONE" is implied.
    // use: "default" is implied.  
}]);

// or set the task id to reference from other tasks
registerSecrets("secrets", [{
    name: "MY_SECRET", // the environment variable / secret key name
    key: "SECRET_ONE", // the key to pass to the vault as the key/path to the secret to get.
    // use: "default" is implied. 
}]);

// or using multiple vaults
registerSecrets("secrets", [{
    name: "MY_SECRET", // the environment variable name
    key: "SECRET_ONE", // the key to pass to the vault as the key/path to the secret to get.
    use: "default" 
}, {
    name: "TWO",
    key: "SECRET_TWO",
    use: "other-vault"
}]);

// or generate secret if it does not exist
registerSecrets("secrets", [{
    name: "MY_SECRET", // the environment variable name
    key: "SECRET_ONE", // the key to pass to the vault as the key/path to the secret to get.
    use: "default",
    gen: true, // defaults to NIST specs which requires 1 upper, 1 lower, 1 digit, and 1 special character and 16 characters in length
}]);

// or generate secrets with finer control if they do not exist.
registerSecrets("secrets", [{
    name: "MY_SECRET", // the environment variable name
    key: "SECRET_ONE", // the key to pass to the vault as the key/path to the secret to get.
    use: "default",
    gen: true, 
    lower: false,
    upper: true, // default
    digits: true, //default
    special: "$%#_-" // special characters that should be used
}]);

// task id, needs, and then delegate task action. 
task("my-task", ["register-secrets", "secrets"], (ctx) => {
    for(const [k, v] of ctx.secrets) {
        console.log(k, v);
    }
})

// to invoke using rex:
// $ rex task my-task 
```